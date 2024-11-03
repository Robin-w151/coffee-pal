import { browser } from '$app/environment';
import type { App, InstallEvent } from '$lib/models/app';
import { writable, type Readable, get } from 'svelte/store';

export interface AppStore extends Readable<App> {
  requestAppInstall: () => Promise<void>;
}

export const appStore = createAppStore();

function createAppStore(): AppStore {
  const initialState = {} as App;
  const { subscribe, update } = writable<App>(initialState);

  if (browser) {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      update((app) => ({ ...app, installEvent: event as InstallEvent }));
    });
  }

  async function requestAppInstall(): Promise<void> {
    const { outcome } = (await get(appStore).installEvent?.prompt()) ?? { outcome: 'dismissed' };
    if (outcome === 'accepted') {
      update((app) => ({ ...app, installEvent: undefined }));
    }
  }

  return { subscribe, requestAppInstall };
}
