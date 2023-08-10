import { browser } from '$app/environment';
import {
  type Entry,
  type JournalEntry,
  type DeletedEntry,
  isJournalEntry,
} from '$lib/models/entry';
import type { Journal, JournalState, JournalSyncResult } from '$lib/models/journal';
import Dexie, { liveQuery, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { writable, type Readable } from 'svelte/store';

export interface JournalStore extends Readable<Journal> {
  add: (entry: JournalEntry) => void;
  edit: (entry: JournalEntry) => void;
  remove: (id: string) => void;
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
const { subscribe, update } = writable<JournalState>(initialState);
let journalDb: JournalDb | null = null;

if (browser) {
  const db = (journalDb = new JournalDb());
  liveQuery(() => db.entries.toCollection().reverse().sortBy('createdAt')).subscribe((entries) => {
    const journalEntries = entries.filter(isJournalEntry);
    update((journal) => ({ ...journal, entries, journalEntries, isLoading: false }));
  });
}

function add(entry: JournalEntry): void {
  const now = DateTime.now().toISO()!;
  entry.createdAt = now;
  entry.updatedAt = now;
  journalDb?.entries.add(entry, entry.id);
}

function edit(entry: JournalEntry): void {
  entry.updatedAt = DateTime.now().toISO()!;
  journalDb?.entries.put(entry, entry.id);
}

function remove(id: string): void {
  const deletedEntry: DeletedEntry = { id, deletedAt: DateTime.now().toISO()! };
  journalDb?.entries.put(deletedEntry, id);
}

function apply(syncResult: JournalSyncResult): void {
  const { updateEntries, deleteEntries } = syncResult;
  if (updateEntries.length > 0) {
    journalDb?.entries.bulkPut(updateEntries);
  }
  if (deleteEntries.length > 0) {
    journalDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
  }
}

export const journalStore = {
  subscribe,
  add,
  edit,
  remove,
  apply,
};
