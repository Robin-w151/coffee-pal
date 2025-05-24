import { derived } from 'svelte/store';
import { onlineStore } from './svelte-legos/online';
import { syncStore } from './sync';

const online = onlineStore();

export const syncAvailabilityStore = derived(
  [online, syncStore],
  ([$online, $sync]) => {
    return {
      isAvailable: !!$sync.connection && $online,
    };
  },
  {
    isAvailable: false,
  },
);
