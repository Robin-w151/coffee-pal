import { browser } from '$app/environment';
import type { App, InstallEvent } from '$lib/models/app';

export interface AppStore extends App {
  requestAppInstall: () => Promise<void>;
  requestAppUpdate: () => Promise<void>;
}

export const appStore = createAppStore();

function createAppStore(): AppStore {
  let updateCheckAvailable = $state(false);
  let checkForUpdateInProgress = $state(false);
  let installAvailable = $state(false);
  let installEvent: InstallEvent | undefined;

  if (browser) {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      installAvailable = true;
      installEvent = event as InstallEvent;
    });

    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      navigator.serviceWorker.ready.then(() => {
        updateCheckAvailable = true;
      });
    }
  }

  async function requestAppInstall(): Promise<void> {
    const { outcome } = (await installEvent?.prompt()) ?? { outcome: 'dismissed' };
    if (outcome === 'accepted') {
      installEvent = undefined;
    }
  }

  async function requestAppUpdate(): Promise<void> {
    if ('serviceWorker' in navigator && navigator.serviceWorker) {
      checkForUpdateInProgress = true;

      const registration = await navigator.serviceWorker.ready;
      try {
        await registration.update();
      } finally {
        checkForUpdateInProgress = false;
      }
    }
  }

  return {
    get updateCheckAvailable() {
      return updateCheckAvailable;
    },
    get checkForUpdateInProgress() {
      return checkForUpdateInProgress;
    },
    get installAvailable() {
      return installAvailable;
    },
    requestAppInstall,
    requestAppUpdate,
  };
}
