import { browser } from '$app/environment';
import { writable, type Readable } from 'svelte/store';

export interface InstallEventStore extends Readable<Event | null> {
  clear: () => void;
}

export const installEventStore = createInstallEventStore();

function createInstallEventStore(): InstallEventStore {
  const { subscribe, set } = writable<Event | null>(null);

  if (browser) {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      set(event);
    });
  }

  function clear(): void {
    set(null);
  }

  return { subscribe, clear };
}
