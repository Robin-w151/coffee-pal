import { type } from 'arktype';
import type { CachedSearchResult } from './cachedSearch';
import { ActiveCoffeeEntry } from './myCoffees';

export const ActiveJournalEntry = type({
  id: 'string',
  method: 'string',
  water: 'number',
  waterTemperature: 'number?',
  coffee: 'number',
  coffeeType: type('string').or(ActiveCoffeeEntry).optional(),
  grindSettings: 'string?',
  rating: 'number?',
  description: 'string?',
  createdAt: 'string.date.iso',
  updatedAt: 'string.date.iso',
});
export type ActiveJournalEntry = typeof ActiveJournalEntry.infer;

export const DeletedJournalEntry = type({
  id: 'string',
  deletedAt: 'string.date.iso',
});
export type DeletedJournalEntry = typeof DeletedJournalEntry.infer;

export const JournalEntry = type(ActiveJournalEntry).or(DeletedJournalEntry);
export type JournalEntry = typeof JournalEntry.infer;

export const Journal = type({
  entries: type(JournalEntry).array(),
});
export type Journal = typeof Journal.infer;

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

export type JournalSort = 'method_coffee_type' | 'rating' | 'updated_at';

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
