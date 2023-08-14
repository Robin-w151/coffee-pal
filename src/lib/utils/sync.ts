import { syncJournal } from '$lib/api/sync';
import {
  isDeletedEntry,
  isJournalEntry,
  type DeletedEntry,
  type Entry,
  type JournalEntry,
} from '$lib/models/entry';
import type { Journal, JournalSyncMergeResult } from '$lib/models/journal';
import { journalStore } from '$lib/stores/journal';
import { syncStore } from '$lib/stores/sync';
import { DateTime } from 'luxon';
import { get } from 'svelte/store';
import { mapToJournal } from './mapper';
import { syncStateStore } from '$lib/stores/syncState';

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

  const localEntries = new Map<string, Entry>();
  registerEntries(localJournal.entries, localEntries, entryIds);

  const remoteEntries = new Map<string, Entry>();
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
  entries: Array<Entry>,
  entryMap: Map<string, Entry>,
  entryIds: Set<string>,
): void {
  entries.forEach((entry) => {
    entryIds.add(entry.id);
    entryMap.set(entry.id, entry);
  });
}

function handleBothPresent(
  result: JournalSyncMergeResult,
  localEntry: Entry,
  remoteEntry: Entry,
): void {
  if (isJournalEntry(localEntry) && isJournalEntry(remoteEntry)) {
    handleBothAreJournalEntries(result, localEntry, remoteEntry);
  } else if (isDeletedEntry(localEntry) && isDeletedEntry(remoteEntry)) {
    handleBothAreDeletedEntries(result, localEntry, remoteEntry);
  } else if (isDeletedEntry(localEntry)) {
    handleLocalIsDeletedEntry(result, localEntry);
  } else if (isDeletedEntry(remoteEntry)) {
    handleRemoteIsDeletedEntry(result, remoteEntry);
  }
}

function handleBothAreJournalEntries(
  result: JournalSyncMergeResult,
  localEntry: JournalEntry,
  remoteEntry: JournalEntry,
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

function handleBothAreDeletedEntries(
  result: JournalSyncMergeResult,
  localEntry: DeletedEntry,
  remoteEntry: DeletedEntry,
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

function handleLocalIsDeletedEntry(result: JournalSyncMergeResult, localEntry: DeletedEntry): void {
  result.localChanges.deleteEntries.push(localEntry);
  result.remoteChanges.deleteEntries.push(localEntry);
  result.mergedJournal.entries.push(localEntry);
}

function handleRemoteIsDeletedEntry(
  result: JournalSyncMergeResult,
  remoteEntry: DeletedEntry,
): void {
  result.localChanges.deleteEntries.push(remoteEntry);
  result.mergedJournal.entries.push(remoteEntry);
}

function handleLocalPresent(result: JournalSyncMergeResult, localEntry: Entry): void {
  if (isJournalEntry(localEntry)) {
    result.remoteChanges.updateEntries.push(localEntry);
    result.mergedJournal.entries.push(localEntry);
  } else if (isDeletedEntry(localEntry)) {
    result.localChanges.deleteEntries.push(localEntry);
  }
}

function handleRemotePresent(result: JournalSyncMergeResult, remoteEntry: Entry): void {
  if (isJournalEntry(remoteEntry)) {
    result.localChanges.updateEntries.push(remoteEntry);
  }
  result.mergedJournal.entries.push(remoteEntry);
}
