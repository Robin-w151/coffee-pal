import { browser } from '$app/environment';
import {
  isActiveCoffeeEntry,
  type ActiveCoffeeEntry,
  type CoffeeEntry,
  type DeletedCoffeeEntry,
  type MyCoffeesState,
} from '$lib/models/myCoffees';
import type { SyncResult } from '$lib/models/sync';
import Dexie, { liveQuery, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { writable, type Readable } from 'svelte/store';

export interface MyCoffeesStore extends Readable<MyCoffeesState> {
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
    this.version(1).stores({ entries: 'id, createdAt, deletedAt' });
  }
}

const initialState: MyCoffeesState = { entries: [], activeEntries: [], isLoading: true };
const removedEntries = new Map<string, ActiveCoffeeEntry>();
const { subscribe, update } = writable<MyCoffeesState>(initialState);
let myCoffeesDb: MyCoffeesDb | null = null;

if (browser) {
  const db = (myCoffeesDb = new MyCoffeesDb());
  liveQuery(() => db.entries.toCollection().reverse().sortBy('createdAt')).subscribe((entries) => {
    const activeEntries = entries.filter(isActiveCoffeeEntry);
    update((myCoffees) => ({ ...myCoffees, entries, activeEntries, isLoading: false }));
  });
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
  const { updateEntries, deleteEntries } = syncResult;
  if (updateEntries.length > 0) {
    myCoffeesDb?.entries.bulkPut(updateEntries);
  }
  if (deleteEntries.length > 0) {
    myCoffeesDb?.entries.bulkDelete(deleteEntries.map((entry) => entry.id));
  }
}

export const myCoffeesStore: MyCoffeesStore = {
  subscribe,
  add: addEntry,
  update: updateEntry,
  remove: removeEntry,
  undo: undoRemoveEntry,
  apply: applySyncResult,
};
