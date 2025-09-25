import type { CachedSearchResult } from './cachedSearch';
import { ActiveCoffeeEntry } from './myCoffees';
import { z } from 'zod';

export const ActiveJournalEntry = z.object({
  id: z.string(),
  method: z.string(),
  water: z.number(),
  waterTemperature: z.number().optional(),
  coffee: z.number(),
  coffeeType: z.union([z.string(), ActiveCoffeeEntry]).optional(),
  grindSettings: z.string().optional(),
  rating: z.number().optional(),
  description: z.string().optional(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type ActiveJournalEntry = z.infer<typeof ActiveJournalEntry>;

export const DeletedJournalEntry = z.object({
  id: z.string(),
  deletedAt: z.string().datetime({ offset: true }),
});
export type DeletedJournalEntry = z.infer<typeof DeletedJournalEntry>;

export const JournalEntry = z.union([ActiveJournalEntry, DeletedJournalEntry]);
export type JournalEntry = z.infer<typeof JournalEntry>;

export const Journal = z.object({
  entries: z.array(JournalEntry),
});
export type Journal = z.infer<typeof Journal>;

export interface JournalState {
  entries: Array<ActiveJournalEntry>;
  totalEntries: number;
  isLoading: boolean;
  page: number;
}

export interface JournalSearchState {
  filter?: string | null;
  sort?: JournalSort | null;
  sortDirection?: JournalSortDirection | null;
}

export type JournalSort = 'method_coffee_type' | 'rating' | 'created_at' | 'updated_at';

export type JournalSortDirection = 'asc' | 'desc';

export interface JournalEntryAction {
  action: JournalEntryActionType;
  payload: JournalEntry | 'string';
}

export type JournalEntryActionType = 'save' | 'copy' | 'remove';

export interface JournalWorker {
  sortOrSearch: (
    entries: Array<ActiveJournalEntry>,
    search: JournalSearchState,
  ) => CachedSearchResult<JournalEntry>;
  loadPage: (index: number, count: number) => Array<ActiveJournalEntry>;
}

export function isActiveJournalEntry(
  entry?: ActiveJournalEntry | DeletedJournalEntry | null,
): entry is ActiveJournalEntry {
  return (entry as ActiveJournalEntry)?.createdAt !== undefined;
}

export function isDeletedJournalEntry(
  entry?: ActiveJournalEntry | DeletedJournalEntry | null,
): entry is DeletedJournalEntry {
  return (entry as DeletedJournalEntry)?.deletedAt !== undefined;
}
