import type { SyncAvailability } from '$lib/models/sync';
import { onlineStore } from 'svelte-legos';
import { derived, type Readable } from 'svelte/store';
import { syncStore, type SyncStore } from './sync';

const initialState: SyncAvailability = { isAvailable: false };
const { subscribe } = derived<[SyncStore, Readable<boolean>], SyncAvailability>(
  [syncStore, onlineStore()],
  ([sync, isOnline], set) => {
    set({ isAvailable: !!sync.connection && isOnline });
  },
  initialState,
);

export const syncAvailabilityStore = { subscribe };
