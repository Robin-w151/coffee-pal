import type { CachedSearchResult } from './cachedSearch';

export interface MyCoffees {
  entries: Array<CoffeeEntry>;
}

export type CoffeeEntry = ActiveCoffeeEntry | DeletedCoffeeEntry;

export interface ActiveCoffeeEntry {
  id: string;
  name: string;
  origin?: string;
  variety?: string;
  process?: string;
  trader?: string;
  aromas: Array<string>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedCoffeeEntry {
  id: string;
  deletedAt: string;
}

export interface MyCoffeesState extends MyCoffees {
  entries: Array<ActiveCoffeeEntry>;
  totalEntries: number;
  isLoading: boolean;
}

export interface MyCoffeesSearchState {
  filter?: string | null;
  sort?: MyCoffeesSort | null;
}

export type MyCoffeesSort = 'asc' | 'desc';

export interface MyCoffeesWorker {
  sortOrSearch: (
    entries: Array<ActiveCoffeeEntry>,
    search: MyCoffeesSearchState,
  ) => CachedSearchResult<ActiveCoffeeEntry>;
  loadMore: (index: number, count: number) => Array<ActiveCoffeeEntry>;
}

export function isActiveCoffeeEntry(
  entry?: ActiveCoffeeEntry | DeletedCoffeeEntry | null,
): entry is ActiveCoffeeEntry {
  return (entry as ActiveCoffeeEntry)?.createdAt !== undefined;
}

export function isDeletedCoffeeEntry(
  entry?: ActiveCoffeeEntry | DeletedCoffeeEntry | null,
): entry is DeletedCoffeeEntry {
  return (entry as DeletedCoffeeEntry)?.deletedAt !== undefined;
}
