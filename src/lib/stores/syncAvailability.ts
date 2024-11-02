import type { SyncAvailability } from '$lib/models/sync';
import { derived, type Readable } from 'svelte/store';
import { syncStore, type SyncStore } from './sync';
import { onlineStore } from './svelte-legos/online';

const initialState: SyncAvailability = { isAvailable: false };
const { subscribe } = derived<[SyncStore, Readable<boolean>], SyncAvailability>(
  [syncStore, onlineStore()],
  ([sync, isOnline], set) => {
    set({ isAvailable: !!sync.connection && isOnline });
  },
  initialState,
);

export const syncAvailabilityStore = { subscribe };
