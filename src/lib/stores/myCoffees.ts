import { browser } from '$app/environment';
import {
  containsString,
  isActiveCoffeeEntry,
  type ActiveCoffeeEntry,
  type CoffeeEntry,
  type DeletedCoffeeEntry,
  type MyCoffeesSearchState,
  type MyCoffeesSort,
  type MyCoffeesState,
} from '$lib/models/myCoffees';
import type { SyncResult } from '$lib/models/sync';
import Dexie, { liveQuery, type Collection, type Table } from 'dexie';
import { DateTime } from 'luxon';
import { BehaviorSubject, switchMap, type Observable } from 'rxjs';
import { writable, type Readable } from 'svelte/store';

export interface MyCoffeesSearchStore extends Observable<MyCoffeesSearchState> {
  setFilter: (filter: string) => void;
  setSort: (sort: MyCoffeesSort) => void;
}

export interface MyCoffeesStore extends Readable<MyCoffeesState> {
  add: (entry: ActiveCoffeeEntry) => void;
  update: (entry: ActiveCoffeeEntry) => void;
  remove: (id: string) => Promise<void>;
  undo: (id: string) => void;
  apply: (syncResult: SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>) => void;
}

type MyCoffeesCollection = Collection<CoffeeEntry, string>;

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

  const myCoffeesSearchStore = subject as unknown as MyCoffeesSearchStore;
  myCoffeesSearchStore.setFilter = setFilter;
  myCoffeesSearchStore.setSort = setSort;
  return myCoffeesSearchStore;
}

function createMyCoffeesStore(myCoffeesSearchStore: MyCoffeesSearchStore): MyCoffeesStore {
  const initialState: MyCoffeesState = { entries: [], activeEntries: [], isLoading: true };
  const removedEntries = new Map<string, ActiveCoffeeEntry>();
  const { subscribe, update } = writable<MyCoffeesState>(initialState);
  let myCoffeesDb: MyCoffeesDb | null = null;

  if (browser) {
    const db = (myCoffeesDb = new MyCoffeesDb());
    myCoffeesSearchStore
      .pipe(
        switchMap((search) => {
          return liveQuery(() => {
            const filter = (collection: MyCoffeesCollection) =>
              collection.filter((entry) => containsString(entry, search?.filter));

            const reverse = (collection: MyCoffeesCollection) =>
              search?.sort === 'asc' ? collection : collection.reverse();

            const sort = (collection: MyCoffeesCollection) => collection.sortBy('name');

            return sort(reverse(filter(db.entries.toCollection())));
          });
        }),
      )
      .subscribe((entries) => {
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

  return {
    subscribe,
    add: addEntry,
    update: updateEntry,
    remove: removeEntry,
    undo: undoRemoveEntry,
    apply: applySyncResult,
  };
}
