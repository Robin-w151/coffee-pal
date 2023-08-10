import {
  isJournalEntry,
  type Entry,
  type JournalEntry,
  type DeletedEntry,
  isDeletedEntry,
} from '$lib/models/entry';
import type { Journal, JournalSyncMergeResult, JournalSyncResult } from '$lib/models/journal';
import type { Connection, SyncClient } from '$lib/models/sync';
import { DateTime } from 'luxon';
import { NextcloudSyncClient } from './nextcloud';

export async function syncJournal(
  connection: Connection,
  journal: Journal,
): Promise<JournalSyncResult> {
  const client = await initSyncClient(connection);
  const lastSync = connection.lastSync ? DateTime.fromISO(connection.lastSync) : undefined;
  return await client.syncJournal(journal, lastSync);
}

async function initSyncClient(connection: Connection): Promise<SyncClient> {
  switch (connection.server.provider) {
    case 'nextcloud': {
      const client = new NextcloudSyncClient(connection);
      await client.init();
      return client;
    }
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
