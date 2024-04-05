import { browser } from '$app/environment';
import { MY_COFFEES_PAGE_SIZE } from '$lib/config/myCoffees';
import type { CachedSearchResult } from '$lib/models/cachedSearch';
import {
  isActiveCoffeeEntry,
  type ActiveCoffeeEntry,
  type CoffeeEntry,
  type DeletedCoffeeEntry,
  type MyCoffeesSearchState,
  type MyCoffeesSort,
  type MyCoffeesState,
} from '$lib/models/myCoffees';
import type { SyncResult } from '$lib/models/sync';
import { loadPage, sortOrSearch, quickSearch } from '$lib/services/myCoffees/wrapper';
import Dexie, { liveQuery, type Observable as DxObservable, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { BehaviorSubject, debounceTime, switchMap, tap, type Observable } from 'rxjs';
import type { Readable } from 'svelte/store';

export interface MyCoffeesSearchStore extends Observable<MyCoffeesSearchState> {
  setFilter: (filter: string) => void;
  setSort: (sort: MyCoffeesSort) => void;
  reset: () => void;
}

export interface MyCoffeesStore extends Readable<MyCoffeesState> {
  loadAll: () => Promise<Array<CoffeeEntry>>;
  loadPage: (page: number) => Promise<void>;
  quickSearch: (filter?: string) => Promise<Array<ActiveCoffeeEntry>>;
  add: (entry: ActiveCoffeeEntry) => void;
  update: (entry: ActiveCoffeeEntry) => void;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => void;
  apply: (syncResult: SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>) => void;
}

const MY_COFFEES_DB_NAME = 'my-coffees';

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
  const initialState: MyCoffeesSearchState = { sort: 'asc' };
  const subject = new BehaviorSubject<MyCoffeesSearchState>(initialState);

  function setFilter(filter: string): void {
    subject.next({ ...subject.value, filter });
  }

  function setSort(sort: MyCoffeesSort): void {
    subject.next({ ...subject.value, sort });
  }

  function reset(): void {
    subject.next(initialState);
  }

  const myCoffeesSearchStore = subject as unknown as MyCoffeesSearchStore;
  myCoffeesSearchStore.setFilter = setFilter;
  myCoffeesSearchStore.setSort = setSort;
  myCoffeesSearchStore.reset = reset;
  return myCoffeesSearchStore;
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
      )
      .subscribe((result) => {
        const { data: entries, totalEntries } = result;
        subject.next({
          ...subject.value,
          entries,
          totalEntries,
          isLoading: false,
          page: 0,
        });
      });
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

  async function quickSearchEntries(filter?: string): Promise<Array<ActiveCoffeeEntry>> {
    const entries = (await myCoffeesDb?.entries.toArray())?.filter(isActiveCoffeeEntry);
    if (entries) {
      return quickSearch(entries, filter);
    } else {
      return [];
    }
  }

  function addEntry(entry: ActiveCoffeeEntry): void {
    const now = DateTime.now().toISO()!;
    entry.createdAt = now;
    entry.updatedAt = now;
    myCoffeesDb?.entries.add(entry, entry.id);
  }

  function updateEntry(entry: ActiveCoffeeEntry): void {
    entry.updatedAt = DateTime.now().toISO()!;
    myCoffeesDb?.entries.put(entry, entry.id);
  }

  async function removeEntry(id: string): Promise<void> {
    const entry = await myCoffeesDb?.entries.get(id);
    if (isActiveCoffeeEntry(entry)) {
      removedEntries.set(id, entry);
    }

    const deletedEntry: DeletedCoffeeEntry = { id, deletedAt: DateTime.now().toISO()! };
    myCoffeesDb?.entries.put(deletedEntry, id);
  }

  function undoRemoveEntry(id: string): void {
    const entry = removedEntries.get(id);
    if (entry) {
      myCoffeesDb?.entries.put(entry, entry.id);
    }
  }

  function applySyncResult(syncResult: SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>): void {
    if (!myCoffeesDb) {
      return;
    }

    const { updateEntries, deleteEntries } = syncResult;
    if (updateEntries.length === 0 && deleteEntries.length === 0) {
      return;
    }

    myCoffeesDb.transaction('readwrite', myCoffeesDb.entries, async () => {
      if (updateEntries.length > 0) {
        myCoffeesDb?.entries.bulkPut(updateEntries);
      }
      if (deleteEntries.length > 0) {
        myCoffeesDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
      }
    });
  }

  const myCoffeesStore = subject as unknown as MyCoffeesStore;
  myCoffeesStore.loadAll = loadAllEntries;
  myCoffeesStore.loadPage = loadPageEntries;
  myCoffeesStore.quickSearch = quickSearchEntries;
  myCoffeesStore.add = addEntry;
  myCoffeesStore.update = updateEntry;
  myCoffeesStore.remove = removeEntry;
  myCoffeesStore.undo = undoRemoveEntry;
  myCoffeesStore.apply = applySyncResult;
  return myCoffeesStore;
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
