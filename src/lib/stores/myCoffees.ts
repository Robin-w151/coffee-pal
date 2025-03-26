import { browser } from '$app/environment';
import { MY_COFFEES_DB_NAME, MY_COFFEES_PAGE_SIZE } from '$lib/config/myCoffees';
import type { CachedSearchResult } from '$lib/models/cachedSearch';
import {
  isActiveCoffeeEntry,
  type ActiveCoffeeEntry,
  type CoffeeEntry,
  type DeletedCoffeeEntry,
  type MyCoffeesSearchState,
  type MyCoffeesSort,
  type MyCoffeesSortDirection,
  type MyCoffeesState,
} from '$lib/models/myCoffees';
import type { SyncResult } from '$lib/models/sync';
import { loadPage, quickSearch, sortOrSearch } from '$lib/services/myCoffees/search/wrapper';
import Dexie, { liveQuery, type Observable as DxObservable, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { BehaviorSubject, debounceTime, switchMap, tap, type Observable } from 'rxjs';
import { journalStore } from './journal';

export interface MyCoffeesSearchStore {
  pipe: Observable<MyCoffeesSearchState>['pipe'];
  subscribe: Observable<MyCoffeesSearchState>['subscribe'];
  setFilter: (filter: string) => void;
  setSort: (sort: MyCoffeesSort, sortDirection: MyCoffeesSortDirection) => void;
  reset: () => void;
}

export interface MyCoffeesStore {
  pipe: Observable<MyCoffeesState>['pipe'];
  subscribe: Observable<MyCoffeesState>['subscribe'];
  loadAll: () => Promise<Array<CoffeeEntry>>;
  loadPage: (page: number) => Promise<void>;
  loadOne: (id: string) => Promise<ActiveCoffeeEntry | undefined>;
  quickSearch: (filter?: string) => Promise<Array<ActiveCoffeeEntry>>;
  add: (entry: ActiveCoffeeEntry) => void;
  update: (entry: ActiveCoffeeEntry) => void;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => void;
  apply: (syncResult: SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>) => void;
}

class MyCoffeesDb extends Dexie {
  entries!: Table<CoffeeEntry, string>;

  constructor() {
    super(MY_COFFEES_DB_NAME);
    this.version(2).stores({ entries: 'id, name, createdAt, deletedAt' });
  }
}

export const myCoffeesSearchStore = createMyCoffeesSearchStore();
export const myCoffeesStore = createMyCoffeesStore(myCoffeesSearchStore);

function createMyCoffeesSearchStore(): MyCoffeesSearchStore {
  const initialState: MyCoffeesSearchState = { sort: 'created_at', sortDirection: 'desc' };
  const subject = new BehaviorSubject<MyCoffeesSearchState>(initialState);

  function setFilter(filter: string): void {
    subject.next({ ...subject.value, filter });
  }

  function setSort(sort: MyCoffeesSort, sortDirection: MyCoffeesSortDirection): void {
    subject.next({ ...subject.value, sort, sortDirection });
  }

  function reset(): void {
    subject.next(initialState);
  }

  return {
    pipe: subject.pipe.bind(subject),
    subscribe: subject.subscribe.bind(subject),
    setFilter,
    setSort,
    reset,
  };
}

function createMyCoffeesStore(myCoffeesSearchStore: MyCoffeesSearchStore): MyCoffeesStore {
  const initialState: MyCoffeesState = {
    entries: [],
    totalEntries: 0,
    isLoading: true,
    page: 0,
  };
  const removedEntries = new Map<string, ActiveCoffeeEntry>();
  const subject = new BehaviorSubject<MyCoffeesState>(initialState);
  let myCoffeesDb: MyCoffeesDb | null = null;

  if (browser) {
    const db = (myCoffeesDb = new MyCoffeesDb());
    myCoffeesSearchStore
      .pipe(
        tap(() => subject.next({ ...subject.value, isLoading: true })),
        debounceTime(250),
        switchMap((search) => createQuery(db, search)),
        tap((result) => {
          const { data: entries, totalEntries } = result;
          const { totalEntries: prevTotalEntries, page } = subject.value;
          if (page && prevTotalEntries === totalEntries) {
            loadPageEntries(page);
          } else {
            subject.next({
              ...subject.value,
              entries,
              totalEntries,
              isLoading: false,
              page: 0,
            });
          }
        }),
      )
      .subscribe();
  }

  async function loadAllEntries(): Promise<Array<CoffeeEntry>> {
    const entries = await myCoffeesDb?.entries.toArray();
    return entries ?? [];
  }

  async function loadPageEntries(page: number): Promise<void> {
    const { totalEntries } = subject.value;
    if (page >= 0 && page * MY_COFFEES_PAGE_SIZE < totalEntries) {
      const entries = await loadPage(page * MY_COFFEES_PAGE_SIZE, MY_COFFEES_PAGE_SIZE);
      subject.next({
        ...subject.value,
        entries,
        page,
      });
    }
  }

  async function loadOneEntry(id: string): Promise<ActiveCoffeeEntry | undefined> {
    const entry = await myCoffeesDb?.entries.get(id);
    if (isActiveCoffeeEntry(entry)) {
      return entry;
    }
  }

  async function quickSearchEntries(filter?: string): Promise<Array<ActiveCoffeeEntry>> {
    const entries = (await myCoffeesDb?.entries.toArray())?.filter(isActiveCoffeeEntry);
    if (entries) {
      return quickSearch(entries, filter);
    } else {
      return [];
    }
  }

  async function addEntry(entry: ActiveCoffeeEntry): Promise<void> {
    const now = DateTime.now().toISO();
    entry.createdAt = now;
    entry.updatedAt = now;
    await myCoffeesDb?.entries.add(entry, entry.id);
  }

  async function updateEntry(entry: ActiveCoffeeEntry): Promise<void> {
    entry.updatedAt = DateTime.now().toISO();
    myCoffeesDb?.entries.put(entry, entry.id);

    await journalStore.updateCoffee(entry);
  }

  async function removeEntry(id: string): Promise<void> {
    const entry = await myCoffeesDb?.entries.get(id);
    if (isActiveCoffeeEntry(entry)) {
      removedEntries.set(id, entry);
    }

    const deletedEntry: DeletedCoffeeEntry = { id, deletedAt: DateTime.now().toISO() };
    await myCoffeesDb?.entries.put(deletedEntry, id);
  }

  async function undoRemoveEntry(id: string): Promise<void> {
    const entry = removedEntries.get(id);
    if (entry) {
      await myCoffeesDb?.entries.put(entry, entry.id);
    }
  }

  async function applySyncResult(
    syncResult: SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>,
  ): Promise<void> {
    if (!myCoffeesDb) {
      return;
    }

    const { updateEntries, deleteEntries } = syncResult;
    if (updateEntries.length === 0 && deleteEntries.length === 0) {
      return;
    }

    await myCoffeesDb.transaction('readwrite', myCoffeesDb.entries, async () => {
      if (updateEntries.length > 0) {
        myCoffeesDb?.entries.bulkPut(updateEntries);
      }
      if (deleteEntries.length > 0) {
        myCoffeesDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
      }
    });
  }

  return {
    pipe: subject.pipe.bind(subject),
    subscribe: subject.subscribe.bind(subject),
    loadAll: loadAllEntries,
    loadPage: loadPageEntries,
    loadOne: loadOneEntry,
    quickSearch: quickSearchEntries,
    add: addEntry,
    update: updateEntry,
    remove: removeEntry,
    undo: undoRemoveEntry,
    apply: applySyncResult,
  };
}

function createQuery(
  db: MyCoffeesDb,
  search: MyCoffeesSearchState,
): DxObservable<CachedSearchResult<ActiveCoffeeEntry>> {
  return liveQuery(async () => {
    const entries = await db.entries.toArray();
    const activeEntries = entries.filter(isActiveCoffeeEntry);
    return sortOrSearch(activeEntries, search);
  });
}
