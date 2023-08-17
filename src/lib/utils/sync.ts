import { syncJournal } from '$lib/api/sync';
import {
  isActiveJournalEntry,
  isDeletedJournalEntry,
  type ActiveJournalEntry,
  type DeletedJournalEntry,
  type Journal,
  type JournalEntry,
  type JournalSyncMergeResult,
} from '$lib/models/journal';
import { journalStore } from '$lib/stores/journal';
import { syncStore } from '$lib/stores/sync';
import { syncStateStore } from '$lib/stores/syncState';
import { DateTime } from 'luxon';
import { get } from 'svelte/store';
import { mapToJournal } from './mapper';

export async function sync(): Promise<void> {
  const sync = get(syncStore);
  if (!sync.connection) {
    return;
  }
  syncStateStore.setIsSynchronizing(true);

  const journalState = get(journalStore);
  const journal = mapToJournal(journalState);

  try {
    const syncResult = await syncJournal(sync.connection, journal);
    journalStore.apply(syncResult);
    syncStore.updateLastSync();
  } finally {
    syncStateStore.setIsSynchronizing(false);
  }
}

export function mergeJournals(
  localJournal: Journal,
  remoteJournal: Journal,
): JournalSyncMergeResult {
  const entryIds = new Set<string>();

  const localEntries = new Map<string, JournalEntry>();
  registerEntries(localJournal.entries, localEntries, entryIds);

  const remoteEntries = new Map<string, JournalEntry>();
  registerEntries(remoteJournal.entries, remoteEntries, entryIds);

  const result: JournalSyncMergeResult = {
    localChanges: {
      updateEntries: [],
      deleteEntries: [],
    },
    remoteChanges: {
      updateEntries: [],
      deleteEntries: [],
    },
    mergedJournal: { entries: [] },
  };

  entryIds.forEach((id) => {
    const localEntry = localEntries.get(id);
    const remoteEntry = remoteEntries.get(id);

    if (localEntry && remoteEntry) {
      handleBothPresent(result, localEntry, remoteEntry);
    } else if (localEntry) {
      handleLocalPresent(result, localEntry);
    } else if (remoteEntry) {
      handleRemotePresent(result, remoteEntry);
    }
  });

  return result;
}

function registerEntries(
  entries: Array<JournalEntry>,
  entryMap: Map<string, JournalEntry>,
  entryIds: Set<string>,
): void {
  entries.forEach((entry) => {
    entryIds.add(entry.id);
    entryMap.set(entry.id, entry);
  });
}

function handleBothPresent(
  result: JournalSyncMergeResult,
  localEntry: JournalEntry,
  remoteEntry: JournalEntry,
): void {
  if (isActiveJournalEntry(localEntry) && isActiveJournalEntry(remoteEntry)) {
    handleBothAreActiveJournalEntries(result, localEntry, remoteEntry);
  } else if (isDeletedJournalEntry(localEntry) && isDeletedJournalEntry(remoteEntry)) {
    handleBothAreDeletedJournalEntries(result, localEntry, remoteEntry);
  } else if (isDeletedJournalEntry(localEntry)) {
    handleLocalIsDeletedEntry(result, localEntry);
  } else if (isDeletedJournalEntry(remoteEntry)) {
    handleRemoteIsDeletedEntry(result, remoteEntry);
  }
}

function handleBothAreActiveJournalEntries(
  result: JournalSyncMergeResult,
  localEntry: ActiveJournalEntry,
  remoteEntry: ActiveJournalEntry,
): void {
  const localUpdatedAt = DateTime.fromISO(localEntry.updatedAt);
  const remoteUpdatedAt = DateTime.fromISO(remoteEntry.updatedAt);
  if (localUpdatedAt > remoteUpdatedAt) {
    result.remoteChanges.updateEntries.push(localEntry);
    result.mergedJournal.entries.push(localEntry);
  } else if (localUpdatedAt < remoteUpdatedAt) {
    result.localChanges.updateEntries.push(remoteEntry);
    result.mergedJournal.entries.push(remoteEntry);
  } else {
    result.mergedJournal.entries.push(localEntry);
  }
}

function handleBothAreDeletedJournalEntries(
  result: JournalSyncMergeResult,
  localEntry: DeletedJournalEntry,
  remoteEntry: DeletedJournalEntry,
): void {
  const localDeletedAt = DateTime.fromISO(localEntry.deletedAt);
  const remoteDeletedAt = DateTime.fromISO(remoteEntry.deletedAt);
  if (localDeletedAt < remoteDeletedAt) {
    result.localChanges.deleteEntries.push(localEntry);
    result.remoteChanges.deleteEntries.push(localEntry);
    result.mergedJournal.entries.push(localEntry);
  } else {
    result.localChanges.deleteEntries.push(remoteEntry);
    result.mergedJournal.entries.push(remoteEntry);
  }
}

function handleLocalIsDeletedEntry(
  result: JournalSyncMergeResult,
  localEntry: DeletedJournalEntry,
): void {
  result.localChanges.deleteEntries.push(localEntry);
  result.remoteChanges.deleteEntries.push(localEntry);
  result.mergedJournal.entries.push(localEntry);
}

function handleRemoteIsDeletedEntry(
  result: JournalSyncMergeResult,
  remoteEntry: DeletedJournalEntry,
): void {
  result.localChanges.deleteEntries.push(remoteEntry);
  result.mergedJournal.entries.push(remoteEntry);
}

function handleLocalPresent(result: JournalSyncMergeResult, localEntry: JournalEntry): void {
  if (isActiveJournalEntry(localEntry)) {
    result.remoteChanges.updateEntries.push(localEntry);
    result.mergedJournal.entries.push(localEntry);
  } else if (isDeletedJournalEntry(localEntry)) {
    result.localChanges.deleteEntries.push(localEntry);
  }
}

function handleRemotePresent(result: JournalSyncMergeResult, remoteEntry: JournalEntry): void {
  if (isActiveJournalEntry(remoteEntry)) {
    result.localChanges.updateEntries.push(remoteEntry);
  }
  result.mergedJournal.entries.push(remoteEntry);
}
