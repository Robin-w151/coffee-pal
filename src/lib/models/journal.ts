import type { DeletedEntry, Entry, JournalEntry } from './entry';

export interface Journal {
  entries: Array<Entry>;
}

export interface JournalState extends Journal {
  journalEntries: Array<JournalEntry>;
  isLoading: boolean;
}

export interface JournalSyncMergeResult {
  localChanges: JournalSyncResult;
  remoteChanges: JournalSyncResult;
  mergedJournal: Journal;
}

export interface JournalSyncResult {
  updateEntries: Array<JournalEntry>;
  deleteEntries: Array<DeletedEntry>;
}
