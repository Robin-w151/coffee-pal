import { syncJournal, syncMyCoffees } from '$lib/api/sync';
import {
  isActiveSyncableEntry,
  isDeletedSyncableEntry,
  type ActiveSyncableEntry,
  type DeletedSyncableEntry,
  type SyncMergeResult,
  type Syncable,
} from '$lib/models/sync';
import { journalStore } from '$lib/stores/journal';
import { syncStore } from '$lib/stores/sync';
import { syncStateStore } from '$lib/stores/syncState';
import { DateTime } from 'luxon';
import { get } from 'svelte/store';
import { mapToJournal, mapToMyCoffees } from './mapper';
import { myCoffeesStore } from '$lib/stores/myCoffees';

export async function sync(): Promise<void> {
  const sync = get(syncStore);
  if (!sync.connection) {
    return;
  }
  syncStateStore.setIsSynchronizing(true);

  const journalState = get(journalStore);
  const journal = mapToJournal(journalState);

  const myCoffeesState = get(myCoffeesStore);
  const myCoffees = mapToMyCoffees(myCoffeesState);

  try {
    const journalSyncResult = await syncJournal(sync.connection, journal);
    journalStore.apply(journalSyncResult);

    const myCoffeesSyncResult = await syncMyCoffees(sync.connection, myCoffees);
    myCoffeesStore.apply(myCoffeesSyncResult);

    syncStore.updateLastSync();
  } finally {
    syncStateStore.setIsSynchronizing(false);
  }
}

export function mergeSyncables<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  local: Syncable<A | D>,
  remote: Syncable<A | D>,
): SyncMergeResult<A, D> {
  const entryIds = new Set<string>();

  const localEntries = new Map<string, A | D>();
  registerEntries(local.entries, localEntries, entryIds);

  const remoteEntries = new Map<string, A | D>();
  registerEntries(remote.entries, remoteEntries, entryIds);

  const result: SyncMergeResult<A, D> = {
    localChanges: {
      updateEntries: [],
      deleteEntries: [],
    },
    remoteChanges: {
      updateEntries: [],
      deleteEntries: [],
    },
    merged: { entries: [] },
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

function registerEntries<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  entries: Array<A | D>,
  entryMap: Map<string, A | D>,
  entryIds: Set<string>,
): void {
  entries.forEach((entry) => {
    entryIds.add(entry.id);
    entryMap.set(entry.id, entry);
  });
}

function handleBothPresent<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  localEntry: A | D,
  remoteEntry: A | D,
): void {
  if (isActiveSyncableEntry(localEntry) && isActiveSyncableEntry(remoteEntry)) {
    handleBothAreActiveEntries(result, localEntry, remoteEntry);
  } else if (isDeletedSyncableEntry(localEntry) && isDeletedSyncableEntry(remoteEntry)) {
    handleBothAreDeletedEntries(result, localEntry, remoteEntry);
  } else if (isDeletedSyncableEntry(localEntry)) {
    handleLocalIsDeletedEntry(result, localEntry);
  } else if (isDeletedSyncableEntry(remoteEntry)) {
    handleRemoteIsDeletedEntry(result, remoteEntry);
  }
}

function handleBothAreActiveEntries<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  localEntry: A,
  remoteEntry: A,
): void {
  const localUpdatedAt = DateTime.fromISO(localEntry.updatedAt);
  const remoteUpdatedAt = DateTime.fromISO(remoteEntry.updatedAt);
  if (localUpdatedAt > remoteUpdatedAt) {
    result.remoteChanges.updateEntries.push(localEntry);
    result.merged.entries.push(localEntry);
  } else if (localUpdatedAt < remoteUpdatedAt) {
    result.localChanges.updateEntries.push(remoteEntry);
    result.merged.entries.push(remoteEntry);
  } else {
    result.merged.entries.push(localEntry);
  }
}

function handleBothAreDeletedEntries<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  localEntry: D,
  remoteEntry: D,
): void {
  const localDeletedAt = DateTime.fromISO(localEntry.deletedAt);
  const remoteDeletedAt = DateTime.fromISO(remoteEntry.deletedAt);
  if (localDeletedAt < remoteDeletedAt) {
    result.localChanges.deleteEntries.push(localEntry);
    result.remoteChanges.deleteEntries.push(localEntry);
    result.merged.entries.push(localEntry);
  } else {
    result.localChanges.deleteEntries.push(remoteEntry);
    result.merged.entries.push(remoteEntry);
  }
}

function handleLocalIsDeletedEntry<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  localEntry: D,
): void {
  result.localChanges.deleteEntries.push(localEntry);
  result.remoteChanges.deleteEntries.push(localEntry);
  result.merged.entries.push(localEntry);
}

function handleRemoteIsDeletedEntry<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  remoteEntry: D,
): void {
  result.localChanges.deleteEntries.push(remoteEntry);
  result.merged.entries.push(remoteEntry);
}

function handleLocalPresent<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  localEntry: A | D,
): void {
  if (isActiveSyncableEntry(localEntry)) {
    result.remoteChanges.updateEntries.push(localEntry);
    result.merged.entries.push(localEntry);
  } else if (isDeletedSyncableEntry(localEntry)) {
    result.localChanges.deleteEntries.push(localEntry);
  }
}

function handleRemotePresent<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
  result: SyncMergeResult<A, D>,
  remoteEntry: A | D,
): void {
  if (isActiveSyncableEntry(remoteEntry)) {
    result.localChanges.updateEntries.push(remoteEntry);
  }
  result.merged.entries.push(remoteEntry);
}
