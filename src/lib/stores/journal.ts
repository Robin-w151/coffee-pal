import { browser } from '$app/environment';
import type { Entry } from '$lib/models/entry';
import type { Journal } from '$lib/models/journal';
import Dexie, { liveQuery, type Table } from 'dexie';
import { writable, type Readable } from 'svelte/store';

export interface JournalStore extends Readable<Journal> {
  add: (entry: Entry) => void;
  edit: (entry: Entry) => void;
  remove: (id: string) => void;
}

const JOURNAL_DB_NAME = 'journal';

class JournalDb extends Dexie {
  entries!: Table<Entry, string>;

  constructor() {
    super(JOURNAL_DB_NAME);
    this.version(1).stores({ entries: 'id, timestamp' });
  }
}

const initialState: Journal = { entries: [], isLoading: true };
const { subscribe, update } = writable<Journal>(initialState);
let journalDb: JournalDb | null = null;

if (browser) {
  const db = (journalDb = new JournalDb());
  liveQuery(() => db.entries.toCollection().reverse().sortBy('timestamp')).subscribe((entries) => {
    update((journal) => ({ ...journal, entries, isLoading: false }));
  });
}

function add(entry: Entry): void {
  journalDb?.entries.add(entry, entry.id);
}

function edit(entry: Entry): void {
  journalDb?.entries.put(entry, entry.id);
}

function remove(id: string): void {
  journalDb?.entries.delete(id);
}

export const journalStore = {
  subscribe,
  add,
  edit,
  remove,
};
