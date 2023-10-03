import type { JournalState, Journal } from '$lib/models/journal';

export function mapToJournal(journalState: JournalState): Journal {
  const clone = structuredClone(journalState) as Partial<JournalState>;
  delete clone.activeEntries;
  delete clone.isLoading;
  return clone as Journal;
}
