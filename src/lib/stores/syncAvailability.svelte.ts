import { getContext, setContext } from 'svelte';
import { fromStore } from 'svelte/store';
import { onlineStore } from './svelte-legos/online';
import type { SyncStoreInterface } from './sync.svelte';

export interface SyncAvailabilityStoreInterface {
  readonly isAvailable: boolean;
}

export class SyncAvailabilityStore implements SyncAvailabilityStoreInterface {
  private readonly syncStore: SyncStoreInterface;
  private readonly online = fromStore(onlineStore());

  constructor(syncStore: SyncStoreInterface) {
    this.syncStore = syncStore;
  }

  get isAvailable(): boolean {
    return !!this.syncStore.connection && this.online.current;
  }
}

const DEFAULT_KEY = Symbol('root_sync_availability_store');

export function getSyncAvailabilityStore(
  key: symbol = DEFAULT_KEY,
): SyncAvailabilityStoreInterface {
  return getContext(key);
}

export function setSyncAvailabilityStore(
  syncStore: SyncStoreInterface,
  key: symbol = DEFAULT_KEY,
): SyncAvailabilityStoreInterface {
  const syncAvailabilityStore = new SyncAvailabilityStore(syncStore);
  return setContext(key, syncAvailabilityStore);
}
