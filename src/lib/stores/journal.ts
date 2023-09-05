import { browser } from '$app/environment';
import {
  containsString,
  isActiveJournalEntry,
  type ActiveJournalEntry,
  type DeletedJournalEntry,
  type JournalEntry,
  type JournalState,
  type JournalSearchState,
  type JournalSort,
} from '$lib/models/journal';
import type { SyncResult } from '$lib/models/sync';
import Dexie, { liveQuery, type Collection, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { writable, type Readable } from 'svelte/store';

export interface JournalSearchStore extends Observable<JournalSearchState> {
  setFilter: (filter: string) => void;
  setSort: (sort: JournalSort) => void;
}

export interface JournalStore extends Readable<JournalState> {
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

export const journalSearchStore: JournalSearchStore = createJournalSearchStore();
export const journalStore: JournalStore = createJournalStore(journalSearchStore);

function createJournalSearchStore(): JournalSearchStore {
  const initialState: JournalSearchState = { sort: 'asc' };
  const subject = new BehaviorSubject<JournalSearchState>(initialState);

  function setFilter(filter: string): void {
    subject.next({ ...subject.value, filter });
  }

  function setSort(sort: JournalSort): void {
    subject.next({ ...subject.value, sort });
  }

  const journalMetaStore = subject as unknown as JournalSearchStore;
  journalMetaStore.setFilter = setFilter;
  journalMetaStore.setSort = setSort;
  return journalMetaStore;
}

function createJournalStore(journalSearchStore: JournalSearchStore): JournalStore {
  const initialState: JournalState = { entries: [], activeEntries: [], isLoading: true };
  const removedEntries = new Map<string, ActiveJournalEntry>();
  const { subscribe, update } = writable<JournalState>(initialState);
  let journalDb: JournalDb | null = null;

  if (browser) {
    const db = (journalDb = new JournalDb());
    journalSearchStore
      .pipe(
        switchMap((meta) => {
          return liveQuery(() => {
            const filter = (collection: Collection<JournalEntry, string>) =>
              collection.filter((entry) => containsString(entry, meta?.filter));

            const reverse = (collection: Collection<JournalEntry, string>) =>
              meta?.sort === 'asc' ? collection : collection.reverse();

            const sort = (collection: Collection<JournalEntry, string>) =>
              collection.sortBy('method');

            return sort(reverse(filter(db.entries.toCollection())));
          });
        }),
      )
      .subscribe((entries) => {
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
