import type { CachedSearchResult } from './cachedSearch';

export interface Journal {
  entries: Array<JournalEntry>;
}

export type JournalEntry = ActiveJournalEntry | DeletedJournalEntry;

export interface ActiveJournalEntry {
  id: string;
  method: string;
  water: number;
  waterTemperature?: number;
  coffee: number;
  coffeeType?: string;
  grindSettings?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedJournalEntry {
  id: string;
  deletedAt: string;
}

export interface JournalState {
  entries: Array<ActiveJournalEntry>;
  totalEntries: number;
  isLoading: boolean;
}

export interface JournalSearchState {
  filter?: string | null;
  sort?: JournalSort | null;
}

export type JournalSort = 'asc' | 'desc';

export interface JournalWorker {
  sortOrSearch: (
    entries: Array<ActiveJournalEntry>,
    search: JournalSearchState,
  ) => CachedSearchResult<JournalEntry>;
  loadMore: (index: number, count: number) => Array<ActiveJournalEntry>;
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
