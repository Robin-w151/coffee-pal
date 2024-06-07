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
  roaster?: string;
  trader?: string;
  aromas: Array<string>;
  rating?: number;
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
  page: number;
}

export interface MyCoffeesSearchState {
  filter?: string | null;
  sort?: MyCoffeesSort | null;
  sortDirection?: MyCoffeesSortDirection | null;
}

export type MyCoffeesSort = 'name_origin' | 'updated_at';

export type MyCoffeesSortDirection = 'asc' | 'desc';

export interface MyCoffeesWorker {
  sortOrSearch: (
    entries: Array<ActiveCoffeeEntry>,
    search: MyCoffeesSearchState,
  ) => CachedSearchResult<ActiveCoffeeEntry>;
  quickSearch: (entries: Array<ActiveCoffeeEntry>, filter?: string) => Array<ActiveCoffeeEntry>;
  loadPage: (index: number, count: number) => Array<ActiveCoffeeEntry>;
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

export function getCoffeeLabel(entry?: string | Partial<ActiveCoffeeEntry>): string | undefined {
  if (entry) {
    if (typeof entry === 'string') {
      return entry;
    } else {
      return [entry.name, entry.roaster || entry.trader]
        .filter((s) => !!s)
        .map((value, index) => (index ? `(${value})` : value))
        .join(' ');
    }
  }
}
