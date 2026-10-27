import type { PersistedState } from 'runed';
import { untrack } from 'svelte';

// Pinned explicitly so the stored format stays plain JSON, as written by the Skeleton v2 store.
export const JSON_SERIALIZER = {
  serialize: JSON.stringify,
  deserialize: JSON.parse,
};

/**
 * Replaces the state's value with `updater(value)`. Untracked as a whole: setters are called from
 * effects, and reading the PersistedState proxy (also when spreading it) would make the effect
 * depend on the value it writes.
 */
export function updatePersistedState<T>(state: PersistedState<T>, updater: (value: T) => T): void {
  untrack(() => {
    state.current = updater(state.current);
  });
}
