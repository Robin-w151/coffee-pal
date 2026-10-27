import {
  Journal,
  type ActiveJournalEntry,
  type DeletedJournalEntry,
  type JournalEntry,
} from '$lib/models/journal';
import {
  MyCoffees,
  type ActiveCoffeeEntry,
  type CoffeeEntry,
  type DeletedCoffeeEntry,
} from '$lib/models/myCoffees';
import type { Connection, SyncClient, SyncResult } from '$lib/models/sync';
import { journalStore } from '$lib/stores/journal';
import { myCoffeesStore } from '$lib/stores/myCoffees';
import { onlineStore } from '$lib/stores/svelte-legos/online';
import type { SyncStoreInterface } from '$lib/stores/sync.svelte';
import { syncStateStore } from '$lib/stores/syncState.svelte';
import { get } from 'svelte/store';
import { setupScheduledTask } from '../scheduler/scheduler';
import { NextcloudSyncClient } from './nextcloud';
import { toast } from '$lib/services/ui/toast.svelte';

const SYNC = Symbol('sync');
const isOnline = onlineStore();

let registeredSyncStore: SyncStoreInterface | undefined;

export async function sync(syncStore: SyncStoreInterface): Promise<void> {
  const connection = syncStore.connection;
  if (!connection) {
    return;
  }

  if (!get(isOnline)) {
    return;
  }

  clearScheduledSync();

  syncStateStore.setIsSynchronizing(true);

  const journalEntries = await journalStore.loadAll();
  const coffeeEntries = await myCoffeesStore.loadAll();

  try {
    const journalSync = syncJournal(connection, journalEntries);
    const myCoffeesSync = syncMyCoffees(connection, coffeeEntries);

    const [journalSyncResult, myCoffeesSyncResult] = await Promise.allSettled([
      journalSync,
      myCoffeesSync,
    ]);

    const applyResults = [];
    if (journalSyncResult.status === 'fulfilled') {
      applyResults.push(journalStore.apply(journalSyncResult.value));
    } else {
      console.error(journalSyncResult.reason);
      toast.error('Failed to sync journal - remote data is corrupted or in an unexpected format');
    }

    if (myCoffeesSyncResult.status === 'fulfilled') {
      applyResults.push(myCoffeesStore.apply(myCoffeesSyncResult.value));
    } else {
      console.error(myCoffeesSyncResult.reason);
      toast.error('Failed to sync myCoffees - remote data is corrupted or in an unexpected format');
    }

    await Promise.all(applyResults);

    syncStore.updateLastSync();
  } finally {
    syncStateStore.setIsSynchronizing(false);
  }
}

export const {
  scheduleExecution: scheduleSync,
  clearScheduledExecution: clearScheduledSync,
  pauseScheduledTask: pauseScheduledSync,
  resumeScheduledTask: resumeScheduledSync,
} = setupScheduledTask(SYNC, () => {
  if (registeredSyncStore) {
    // Fire and forget, like every scheduled task; sync() reports its own failures as toasts.
    void sync(registeredSyncStore);
  }
});

/** Registers the store the scheduled sync uses; it runs from timers, outside any component. */
export function initScheduledSync(syncStore: SyncStoreInterface): void {
  registeredSyncStore = syncStore;
}

async function syncJournal(
  connection: Connection,
  entries: Array<JournalEntry>,
): Promise<SyncResult<ActiveJournalEntry, DeletedJournalEntry>> {
  const client = await initSyncClient(connection);
  return await client.sync<ActiveJournalEntry, DeletedJournalEntry>(
    { entries },
    'journal',
    Journal,
  );
}

async function syncMyCoffees(
  connection: Connection,
  entries: Array<CoffeeEntry>,
): Promise<SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>> {
  const client = await initSyncClient(connection);
  return await client.sync<ActiveCoffeeEntry, DeletedCoffeeEntry>(
    { entries },
    'my-coffees',
    MyCoffees,
  );
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
