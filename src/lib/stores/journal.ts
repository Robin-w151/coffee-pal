import { browser } from '$app/environment';
import {
  isJournalEntry,
  type DeletedEntry,
  type Entry,
  type JournalEntry,
} from '$lib/models/entry';
import type { JournalState, JournalSyncResult } from '$lib/models/journal';
import Dexie, { liveQuery, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { writable, type Readable } from 'svelte/store';

export interface JournalStore extends Readable<JournalState> {
  add: (entry: JournalEntry) => void;
  update: (entry: JournalEntry) => void;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => void;
  apply: (syncResult: JournalSyncResult) => void;
}

const JOURNAL_DB_NAME = 'journal';

class JournalDb extends Dexie {
  entries!: Table<Entry, string>;

  constructor() {
    super(JOURNAL_DB_NAME);
    this.version(1).stores({ entries: 'id, createdAt, deletedAt' });
  }
}

const initialState: JournalState = { entries: [], journalEntries: [], isLoading: true };
const removedEntries = new Map<string, JournalEntry>();
const { subscribe, update } = writable<JournalState>(initialState);
let journalDb: JournalDb | null = null;

if (browser) {
  const db = (journalDb = new JournalDb());
  liveQuery(() => db.entries.toCollection().reverse().sortBy('createdAt')).subscribe((entries) => {
    const journalEntries = entries.filter(isJournalEntry);
    update((journal) => ({ ...journal, entries, journalEntries, isLoading: false }));
  });
}

function addEntry(entry: JournalEntry): void {
  const now = DateTime.now().toISO()!;
  entry.createdAt = now;
  entry.updatedAt = now;
  journalDb?.entries.add(entry, entry.id);
}

function updateEntry(entry: JournalEntry): void {
  entry.updatedAt = DateTime.now().toISO()!;
  journalDb?.entries.put(entry, entry.id);
}

async function removeEntry(id: string): Promise<void> {
  const entry = await journalDb?.entries.get(id);
  if (isJournalEntry(entry)) {
    removedEntries.set(id, entry);
  }

  const deletedEntry: DeletedEntry = { id, deletedAt: DateTime.now().toISO()! };
  journalDb?.entries.put(deletedEntry, id);
}

function undoRemoveEntry(id: string): void {
  const entry = removedEntries.get(id);
  if (entry) {
    journalDb?.entries.put(entry, entry.id);
  }
}

function applySyncResult(syncResult: JournalSyncResult): void {
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
