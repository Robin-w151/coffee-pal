import { browser } from '$app/environment';
import {
  isActiveJournalEntry,
  type ActiveJournalEntry,
  type DeletedJournalEntry,
  type JournalEntry,
  type JournalState,
} from '$lib/models/journal';
import type { SyncResult } from '$lib/models/sync';
import Dexie, { liveQuery, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { writable, type Readable } from 'svelte/store';

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
    this.version(1).stores({ entries: 'id, createdAt, deletedAt' });
  }
}

const initialState: JournalState = { entries: [], activeEntries: [], isLoading: true };
const removedEntries = new Map<string, ActiveJournalEntry>();
const { subscribe, update } = writable<JournalState>(initialState);
let journalDb: JournalDb | null = null;

if (browser) {
  const db = (journalDb = new JournalDb());
  liveQuery(() => db.entries.toCollection().reverse().sortBy('createdAt')).subscribe((entries) => {
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

export const journalStore: JournalStore = {
  subscribe,
  add: addEntry,
  update: updateEntry,
  remove: removeEntry,
  undo: undoRemoveEntry,
  apply: applySyncResult,
};
