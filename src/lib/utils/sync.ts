import { syncJournal } from '$lib/api/cloud-sync';
import { journalStore } from '$lib/stores/journal';
import { syncStore } from '$lib/stores/sync';
import { get } from 'svelte/store';
import { mapToJournal } from './mapper';

export async function sync(): Promise<void> {
  const sync = get(syncStore);
  if (!sync.connection) {
    return;
  }
  syncStore.setIsSynchronizing(true);

  const journalState = get(journalStore);
  const journal = mapToJournal(journalState);
  const syncResult = await syncJournal(sync.connection, journal);
  journalStore.apply(syncResult);

  syncStore.updateLastSync();
}
