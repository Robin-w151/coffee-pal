import type { Journal, JournalState } from '$lib/models/journal';

export function mapToJournal(journalState: JournalState): Journal {
  const clone = { ...journalState } as Partial<JournalState>;
  delete clone.journalEntries;
  delete clone.isLoading;
  return clone as Journal;
}
