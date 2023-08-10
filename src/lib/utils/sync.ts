import { syncJournal } from '$lib/api/cloud-sync';
import type { JournalState } from '$lib/models/journal';
import type { Sync } from '$lib/models/sync';
import { journalStore } from '$lib/stores/journal';
import { syncStore } from '$lib/stores/sync';
import { mapToJournal } from './mapper';

export async function sync(sync: Sync, journalState: JournalState): Promise<void> {
  if (!sync.connection) {
    return;
  }

  syncStore.setIsSynchronizing(true);
  const journal = mapToJournal(journalState);
  const syncResult = await syncJournal(sync.connection, journal);
  journalStore.apply(syncResult);
  syncStore.updateLastSync();
}
