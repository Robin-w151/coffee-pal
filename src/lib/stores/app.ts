import { browser } from '$app/environment';
import { writable, type Readable } from 'svelte/store';

export interface InstallEventStore extends Readable<InstallEvent | null> {
  clear: () => void;
}

export interface InstallEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const installEventStore = createInstallEventStore();

function createInstallEventStore(): InstallEventStore {
  const { subscribe, set } = writable<InstallEvent | null>(null);

  if (browser) {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      set(event as InstallEvent);
    });
  }

  function clear(): void {
    set(null);
  }

  return { subscribe, clear };
}
