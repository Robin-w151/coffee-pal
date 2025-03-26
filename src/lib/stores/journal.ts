import { browser } from '$app/environment';
import { JOURNAL_DB_NAME, JOURNAL_PAGE_SIZE } from '$lib/config/journal';
import type { CachedSearchResult } from '$lib/models/cachedSearch';
import {
  isActiveJournalEntry,
  type ActiveJournalEntry,
  type DeletedJournalEntry,
  type JournalEntry,
  type JournalSearchState,
  type JournalSort,
  type JournalSortDirection,
  type JournalState,
} from '$lib/models/journal';
import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
import type { SyncResult } from '$lib/models/sync';
import { loadPage, sortOrSearch } from '$lib/services/journal/wrapper';
import Dexie, { liveQuery, type Observable as DxObservable, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { BehaviorSubject, debounceTime, switchMap, tap, type Observable } from 'rxjs';

export interface JournalSearchStore {
  pipe: Observable<JournalSearchState>['pipe'];
  subscribe: Observable<JournalSearchState>['subscribe'];
  setFilter: (filter: string) => void;
  setSort: (sort: JournalSort, sortDirection: JournalSortDirection) => void;
  reset: () => void;
}

export interface JournalStore {
  pipe: Observable<JournalState>['pipe'];
  subscribe: Observable<JournalState>['subscribe'];
  loadAll: () => Promise<Array<JournalEntry>>;
  loadPage: (page: number) => Promise<void>;
  loadOne: (id: string) => Promise<ActiveJournalEntry | undefined>;
  add: (entry: ActiveJournalEntry) => Promise<void>;
  update: (entry: ActiveJournalEntry) => Promise<void>;
  updateCoffee: (entry: ActiveCoffeeEntry) => Promise<void>;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => Promise<void>;
  apply: (syncResult: SyncResult<ActiveJournalEntry, DeletedJournalEntry>) => Promise<void>;
}

class JournalDb extends Dexie {
  entries!: Table<JournalEntry, string>;

  constructor() {
    super(JOURNAL_DB_NAME);
    this.version(2).stores({ entries: 'id, method, createdAt, deletedAt' });
  }
}

export const journalSearchStore = createJournalSearchStore();
export const journalStore = createJournalStore(journalSearchStore);

function createJournalSearchStore(): JournalSearchStore {
  const initialState: JournalSearchState = { sort: 'created_at', sortDirection: 'desc' };
  const subject = new BehaviorSubject<JournalSearchState>(initialState);

  function setFilter(filter: string): void {
    subject.next({ ...subject.value, filter });
  }

  function setSort(sort: JournalSort, sortDirection: JournalSortDirection): void {
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

function createJournalStore(journalSearchStore: JournalSearchStore): JournalStore {
  const initialState: JournalState = {
    entries: [],
    totalEntries: 0,
    isLoading: true,
    page: 0,
  };
  const removedEntries = new Map<string, ActiveJournalEntry>();
  const subject = new BehaviorSubject<JournalState>(initialState);
  let journalDb: JournalDb | null = null;

  if (browser) {
    const db = (journalDb = new JournalDb());
    journalSearchStore
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

  async function loadAllEntries(): Promise<Array<JournalEntry>> {
    const entries = await journalDb?.entries.toArray();
    return entries ?? [];
  }

  async function loadPageEntries(page: number): Promise<void> {
    const { totalEntries } = subject.value;
    if (page >= 0 && page * JOURNAL_PAGE_SIZE < totalEntries) {
      const entries = await loadPage(page * JOURNAL_PAGE_SIZE, JOURNAL_PAGE_SIZE);
      subject.next({
        ...subject.value,
        entries,
        page,
        isLoading: false,
      });
    }
  }

  async function loadOneEntry(id: string): Promise<ActiveJournalEntry | undefined> {
    const entry = await journalDb?.entries.get(id);
    if (isActiveJournalEntry(entry)) {
      return entry;
    }
  }

  async function addEntry(entry: ActiveJournalEntry): Promise<void> {
    const now = DateTime.now().toISO();
    entry.createdAt = now;
    entry.updatedAt = now;
    await journalDb?.entries.add(entry, entry.id);
  }

  async function updateEntry(entry: ActiveJournalEntry): Promise<void> {
    entry.updatedAt = DateTime.now().toISO();
    await journalDb?.entries.put(entry, entry.id);
  }

  async function updateCoffeeEntry(coffeeEntry: ActiveCoffeeEntry): Promise<void> {
    await journalDb?.transaction('readwrite', journalDb.entries, async () => {
      const entries = await journalDb.entries
        .filter(
          (entry) =>
            isActiveJournalEntry(entry) &&
            typeof entry.coffeeType === 'object' &&
            entry.coffeeType.id === coffeeEntry.id,
        )
        .toArray();

      entries.forEach((entry) => {
        journalDb.entries.put({
          ...entry,
          coffeeType: coffeeEntry,
        });
      });
    });
  }

  async function removeEntry(id: string): Promise<void> {
    const entry = await journalDb?.entries.get(id);
    if (isActiveJournalEntry(entry)) {
      removedEntries.set(id, entry);
    }

    const deletedEntry: DeletedJournalEntry = { id, deletedAt: DateTime.now().toISO() };
    await journalDb?.entries.put(deletedEntry, id);
  }

  async function undoRemoveEntry(id: string): Promise<void> {
    const entry = removedEntries.get(id);
    if (entry) {
      await journalDb?.entries.put(entry, entry.id);
    }
  }

  async function applySyncResult(
    syncResult: SyncResult<ActiveJournalEntry, DeletedJournalEntry>,
  ): Promise<void> {
    if (!journalDb) {
      return;
    }

    const { updateEntries, deleteEntries } = syncResult;
    if (updateEntries.length === 0 && deleteEntries.length === 0) {
      return;
    }

    await journalDb.transaction('readwrite', journalDb.entries, async () => {
      if (updateEntries.length > 0) {
        journalDb?.entries.bulkPut(updateEntries);
      }
      if (deleteEntries.length > 0) {
        journalDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
      }
    });
  }

  return {
    pipe: subject.pipe.bind(subject),
    subscribe: subject.subscribe.bind(subject),
    loadAll: loadAllEntries,
    loadPage: loadPageEntries,
    loadOne: loadOneEntry,
    add: addEntry,
    update: updateEntry,
    updateCoffee: updateCoffeeEntry,
    remove: removeEntry,
    undo: undoRemoveEntry,
    apply: applySyncResult,
  };
}

function createQuery(
  db: JournalDb,
  search: JournalSearchState,
): DxObservable<CachedSearchResult<ActiveJournalEntry>> {
  return liveQuery(async () => {
    const entries = await db.entries.toArray();
    const activeEntries = entries.filter(isActiveJournalEntry);
    return await sortOrSearch(activeEntries, search);
  });
}
