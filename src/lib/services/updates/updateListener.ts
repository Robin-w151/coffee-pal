export interface UpdateActions {
  restart: () => void;
}

let isRefreshing = false;

export async function listenForUpdates(callback: (actions: UpdateActions) => void) {
  if ('serviceWorker' in navigator && navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) {
        return;
      }
      isRefreshing = true;

      const refresh = () => {
        globalThis.location.reload();
      };

      refresh();
      setTimeout(() => {
        refresh();
      }, 3000);
    });

    const registration = await navigator.serviceWorker.ready;
    const restart = () => {
      registration.waiting?.postMessage('SKIP_WAITING');
    };
    const actions: UpdateActions = { restart };
    const awaitStateChange = () => {
      registration.installing?.addEventListener('statechange', function () {
        if (this.state === 'installed') {
          callback(actions);
        }
      });
    };

    if (!registration) {
      return;
    }

    if (registration.waiting) {
      return callback(actions);
    }

    if (registration.installing) {
      awaitStateChange();
    }

    registration.addEventListener('updatefound', awaitStateChange);
  }
}
