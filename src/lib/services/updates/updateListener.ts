export interface UpdateActions {
  restart: () => void;
}

export async function listenForUpdates(callback: (actions: UpdateActions) => void) {
  const registration = await navigator.serviceWorker.ready;
  const actions: UpdateActions = { restart };

  function restart() {
    registration.waiting?.postMessage('SKIP_WAITING');
  }

  function awaitStateChange() {
    registration.installing?.addEventListener('statechange', function () {
      if (this.state === 'installed') {
        callback(actions);
      }
    });
  }

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
