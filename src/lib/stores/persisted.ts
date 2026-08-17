import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

/**
 * A writable store backed by `localStorage`.
 *
 * Replaces Skeleton v2's `localStorageStore`, which was dropped in v3 as
 * incompatible with Svelte 5. The serialization format is deliberately
 * identical (plain `JSON.stringify` under the bare key) so existing user data
 * keeps working, and so the inline script in `app.html` can keep reading the
 * settings key before hydration.
 */
export function persistedStore<T>(key: string, initialValue: T): Writable<T> {
  const store = writable<T>(read(key, initialValue));

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    window.addEventListener('storage', (event) => {
      if (event.key === key) {
        store.set(read(key, initialValue));
      }
    });
  }

  return store;
}

function read<T>(key: string, initialValue: T): T {
  if (!browser) {
    return initialValue;
  }

  const value = localStorage.getItem(key);
  if (value === null) {
    return initialValue;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return initialValue;
  }
}
