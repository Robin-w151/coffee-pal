import type { SyncAvailability } from '$lib/models/sync';
import { syncStore } from './sync';
import { onlineStore } from './svelte-legos/online';
import { fromStore } from 'svelte/store';

export const syncAvailabilityStore = createSyncAvailabilityStore();

function createSyncAvailabilityStore(): SyncAvailability {
  const online = fromStore(onlineStore());
  const sync = fromStore(syncStore);

  const isAvailable = $derived(!!sync.current.connection && online.current);

  return {
    get isAvailable() {
      return isAvailable;
    },
  };
}
