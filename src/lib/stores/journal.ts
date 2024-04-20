import { browser } from '$app/environment';
import { JOURNAL_PAGE_SIZE } from '$lib/config/journal';
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
import type { SyncResult } from '$lib/models/sync';
import { loadPage, sortOrSearch } from '$lib/services/journal/wrapper';
import Dexie, { liveQuery, type Observable as DxObservable, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { BehaviorSubject, debounceTime, switchMap, tap, type Observable } from 'rxjs';

export interface JournalSearchStore extends Observable<JournalSearchState> {
  setFilter: (filter: string) => void;
  setSort: (sort: JournalSort, sortDirection: JournalSortDirection) => void;
  reset: () => void;
}

export interface JournalStore extends Observable<JournalState> {
  loadAll: () => Promise<Array<JournalEntry>>;
  loadPage: (page: number) => Promise<void>;
  loadOne: (id: string) => Promise<ActiveJournalEntry | undefined>;
  add: (entry: ActiveJournalEntry) => void;
  update: (entry: ActiveJournalEntry) => void;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => void;
  apply: (syncResult: SyncResult<ActiveJournalEntry, DeletedJournalEntry>) => void;
}

const JOURNAL_DB_NAME = 'journal';

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
  const initialState: JournalSearchState = { sort: 'updated_at', sortDirection: 'desc' };
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

  const journalMetaStore = subject as unknown as JournalSearchStore;
  journalMetaStore.setFilter = setFilter;
  journalMetaStore.setSort = setSort;
  journalMetaStore.reset = reset;
  return journalMetaStore;
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

  function addEntry(entry: ActiveJournalEntry): void {
    const now = DateTime.now().toISO()!;
    entry.createdAt = now;
    entry.updatedAt = now;
    journalDb?.entries.add(entry, entry.id);
  }

  function updateEntry(entry: ActiveJournalEntry): void {
    entry.updatedAt = DateTime.now().toISO()!;
    journalDb?.entries.put(entry, entry.id);
  }

  async function removeEntry(id: string): Promise<void> {
    const entry = await journalDb?.entries.get(id);
    if (isActiveJournalEntry(entry)) {
      removedEntries.set(id, entry);
    }

    const deletedEntry: DeletedJournalEntry = { id, deletedAt: DateTime.now().toISO()! };
    journalDb?.entries.put(deletedEntry, id);
  }

  function undoRemoveEntry(id: string): void {
    const entry = removedEntries.get(id);
    if (entry) {
      journalDb?.entries.put(entry, entry.id);
    }
  }

  function applySyncResult(syncResult: SyncResult<ActiveJournalEntry, DeletedJournalEntry>): void {
    if (!journalDb) {
      return;
    }

    const { updateEntries, deleteEntries } = syncResult;
    if (updateEntries.length === 0 && deleteEntries.length === 0) {
      return;
    }

    journalDb.transaction('readwrite', journalDb.entries, async () => {
      if (updateEntries.length > 0) {
        journalDb?.entries.bulkPut(updateEntries);
      }
      if (deleteEntries.length > 0) {
        journalDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
      }
    });
  }

  const journalStore = subject as unknown as JournalStore;
  journalStore.loadAll = loadAllEntries;
  journalStore.loadPage = loadPageEntries;
  journalStore.loadOne = loadOneEntry;
  journalStore.add = addEntry;
  journalStore.update = updateEntry;
  journalStore.remove = removeEntry;
  journalStore.undo = undoRemoveEntry;
  journalStore.apply = applySyncResult;
  return journalStore;
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
