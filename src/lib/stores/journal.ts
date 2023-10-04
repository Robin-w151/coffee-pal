import { browser } from '$app/environment';
import {
  isActiveJournalEntry,
  type ActiveJournalEntry,
  type DeletedJournalEntry,
  type JournalEntry,
  type JournalSearchState,
  type JournalSort,
  type JournalState,
} from '$lib/models/journal';
import type { SyncResult } from '$lib/models/sync';
import { sort } from '$lib/services/sort/journal/wrapper';
import { buildFuseQuery } from '$lib/utils/search/fuzzy';
import Dexie, { liveQuery, type Observable as DxObservable, type Table } from 'dexie';
import Fuse from 'fuse.js';
import { DateTime } from 'luxon';
import { BehaviorSubject, switchMap, type Observable } from 'rxjs';
import { writable, type Readable } from 'svelte/store';

export interface JournalSearchStore extends Observable<JournalSearchState> {
  setFilter: (filter: string) => void;
  setSort: (sort: JournalSort) => void;
  reset: () => void;
}

export interface JournalStore extends Readable<JournalState> {
  add: (entry: ActiveJournalEntry) => void;
  update: (entry: ActiveJournalEntry) => void;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => void;
  apply: (syncResult: SyncResult<ActiveJournalEntry, DeletedJournalEntry>) => void;
}

const JOURNAL_DB_NAME = 'journal';
const FUSE_OPTIONS = {
  threshold: 0.4,
  ignoreLocation: true,
  findAllMatches: true,
  keys: [
    'method',
    'water',
    'waterTemperature',
    'coffee',
    'coffeeType',
    'grindSettings',
    'description',
  ],
} satisfies Fuse.IFuseOptions<JournalEntry>;

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
  const initialState: JournalSearchState = { sort: 'asc' };
  const subject = new BehaviorSubject<JournalSearchState>(initialState);

  function setFilter(filter: string): void {
    subject.next({ ...subject.value, filter });
  }

  function setSort(sort: JournalSort): void {
    subject.next({ ...subject.value, sort });
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
  const initialState: JournalState = { entries: [], activeEntries: [], isLoading: true };
  const removedEntries = new Map<string, ActiveJournalEntry>();
  const { subscribe, update } = writable<JournalState>(initialState);
  let journalDb: JournalDb | null = null;

  if (browser) {
    const db = (journalDb = new JournalDb());
    journalSearchStore.pipe(switchMap((search) => createQuery(db, search))).subscribe((entries) => {
      const activeEntries = entries.filter(isActiveJournalEntry);
      update((journal) => ({ ...journal, entries, activeEntries, isLoading: false }));
    });
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
    const { updateEntries, deleteEntries } = syncResult;
    if (updateEntries.length > 0) {
      journalDb?.entries.bulkPut(updateEntries);
    }
    if (deleteEntries.length > 0) {
      journalDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
    }
  }

  return {
    subscribe,
    add: addEntry,
    update: updateEntry,
    remove: removeEntry,
    undo: undoRemoveEntry,
    apply: applySyncResult,
  };
}

function createQuery(db: JournalDb, search: JournalSearchState): DxObservable<Array<JournalEntry>> {
  return liveQuery(async () => {
    const entries = await sort(await db.entries.toArray());
    return fuzzyFilter(entries, search.filter);
  });
}

function fuzzyFilter(entries: Array<JournalEntry>, filter?: string | null): Array<JournalEntry> {
  if (filter) {
    const filterQuery = buildFuseQuery(filter, FUSE_OPTIONS.keys);
    const fuse = new Fuse(entries, FUSE_OPTIONS);
    return fuse.search(filterQuery).map((result) => result.item);
  } else {
    return entries;
  }
}
