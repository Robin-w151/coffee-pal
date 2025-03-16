import { type } from 'arktype';
import type { CachedSearchResult } from './cachedSearch';

export const ActiveCoffeeEntry = type({
  id: 'string',
  name: 'string',
  origin: 'string?',
  variety: 'string?',
  process: 'string?',
  altitude: 'number?',
  roaster: 'string?',
  trader: 'string?',
  aromas: 'string[]',
  rating: 'number?',
  description: 'string?',
  createdAt: 'string.date.iso',
  updatedAt: 'string.date.iso',
});
export type ActiveCoffeeEntry = typeof ActiveCoffeeEntry.infer;

export const DeletedCoffeeEntry = type({
  id: 'string',
  deletedAt: 'string.date.iso',
});
export type DeletedCoffeeEntry = typeof DeletedCoffeeEntry.infer;

export const CoffeeEntry = type(ActiveCoffeeEntry).or(DeletedCoffeeEntry);
export type CoffeeEntry = typeof CoffeeEntry.infer;

export const MyCoffees = type({
  entries: type(CoffeeEntry).array(),
});
export type MyCoffees = typeof MyCoffees.infer;

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

export type MyCoffeesSort = 'name_origin' | 'altitude' | 'rating' | 'updated_at';

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
