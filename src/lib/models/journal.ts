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

export interface JournalState extends Journal {
  activeEntries: Array<ActiveJournalEntry>;
  isLoading: boolean;
}

export interface JournalSearchState {
  filter?: string | null;
  sort?: JournalSort | null;
}

export type JournalSort = 'asc' | 'desc';

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
