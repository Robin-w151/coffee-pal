import type { CachedSearchResult } from './cachedSearch';
import { z } from 'zod';

export const ActiveCoffeeEntry = z.object({
  id: z.string(),
  name: z.string(),
  origin: z.string().optional(),
  variety: z.string().optional(),
  process: z.string().optional(),
  roaster: z.string().optional(),
  trader: z.string().optional(),
  aromas: z.array(z.string()),
  rating: z.number().optional(),
  description: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});
export type ActiveCoffeeEntry = z.infer<typeof ActiveCoffeeEntry>;

export const DeletedCoffeeEntry = z.object({
  id: z.string(),
  deletedAt: z.string().datetime({ offset: true }),
});
export type DeletedCoffeeEntry = z.infer<typeof DeletedCoffeeEntry>;

export const CoffeeEntry = z.union([ActiveCoffeeEntry, DeletedCoffeeEntry]);
export type CoffeeEntry = z.infer<typeof CoffeeEntry>;

export const MyCoffees = z.object({
  entries: z.array(CoffeeEntry),
});
export type MyCoffees = z.infer<typeof MyCoffees>;

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
