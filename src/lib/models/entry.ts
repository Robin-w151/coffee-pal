export type Entry = JournalEntry | DeletedEntry;

export interface JournalEntry {
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

export interface DeletedEntry {
  id: string;
  deletedAt: string;
}

export function isJournalEntry(entry?: JournalEntry | DeletedEntry | null): entry is JournalEntry {
  return (entry as JournalEntry)?.createdAt !== undefined;
}

export function isDeletedEntry(entry?: JournalEntry | DeletedEntry | null): entry is DeletedEntry {
  return (entry as DeletedEntry)?.deletedAt !== undefined;
}
