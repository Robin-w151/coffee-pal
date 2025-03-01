import { browser } from '$app/environment';
import type { App, InstallEvent } from '$lib/models/app';
import { writable, type Readable, get } from 'svelte/store';

export interface AppStore extends Readable<App> {
  requestAppInstall: () => Promise<void>;
  requestAppUpdate: () => Promise<void>;
}

export const appStore = createAppStore();

function createAppStore(): AppStore {
  const initialState: App = {
    updateCheckAvailable: false,
  };
  const { subscribe, update } = writable<App>(initialState);

  if (browser) {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      update((app) => ({ ...app, installEvent: event as InstallEvent }));
    });

    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(() => {
        update((app) => ({
          ...app,
          updateCheckAvailable: true,
        }));
      });
    }
  }

  async function requestAppInstall(): Promise<void> {
    const { outcome } = (await get(appStore).installEvent?.prompt()) ?? { outcome: 'dismissed' };
    if (outcome === 'accepted') {
      update((app) => ({ ...app, installEvent: undefined }));
    }
  }

  async function requestAppUpdate(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      const registration = await navigator.serviceWorker.ready;
      registration.update();
    }
  }

  return { subscribe, requestAppInstall, requestAppUpdate };
}
