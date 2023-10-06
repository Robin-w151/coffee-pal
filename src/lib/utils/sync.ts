import { syncJournal, syncMyCoffees } from '$lib/services/sync/sync';
import { journalStore } from '$lib/stores/journal';
import { myCoffeesStore } from '$lib/stores/myCoffees';
import { syncStore } from '$lib/stores/sync';
import { syncStateStore } from '$lib/stores/syncState';
import { get } from 'svelte/store';

export async function sync(): Promise<void> {
  const sync = get(syncStore);
  if (!sync.connection) {
    return;
  }
  syncStateStore.setIsSynchronizing(true);

  const journalEntries = await journalStore.loadAll();
  const coffeeEntries = await myCoffeesStore.loadAll();

  try {
    const journalSync = syncJournal(sync.connection, journalEntries);
    const myCoffeesSync = syncMyCoffees(sync.connection, coffeeEntries);

    const [journalSyncResult, myCoffeesSyncResult] = await Promise.allSettled([
      journalSync,
      myCoffeesSync,
    ]);

    if (journalSyncResult.status === 'fulfilled') {
      journalStore.apply(journalSyncResult.value);
    }

    if (myCoffeesSyncResult.status === 'fulfilled') {
      myCoffeesStore.apply(myCoffeesSyncResult.value);
    }

    syncStore.updateLastSync();
  } finally {
    syncStateStore.setIsSynchronizing(false);
  }
}
