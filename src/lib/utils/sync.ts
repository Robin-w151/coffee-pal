import { mapToJournal } from '$lib/services/mapper/journal';
import { mapToMyCoffees } from '$lib/services/mapper/myCoffees';
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

  const journalState = get(journalStore);
  const journal = mapToJournal(journalState);

  const myCoffeesState = get(myCoffeesStore);
  const myCoffees = mapToMyCoffees(myCoffeesState);

  try {
    const journalSync = syncJournal(sync.connection, journal);
    const myCoffeesSync = syncMyCoffees(sync.connection, myCoffees);

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
