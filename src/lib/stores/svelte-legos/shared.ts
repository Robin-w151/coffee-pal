import type { Readable, Writable } from 'svelte/store';

export interface ConfigurableWindow {
  /*
   * Specify a custom `window` instance, e.g. working with iframes or in testing environments.
   */
  window?: Window;
}

export const isClient = typeof globalThis.window !== 'undefined';
export const defaultWindow = isClient ? globalThis.window : undefined;

export function tryOnDestroy(_fn: () => void) {
  // NOT IMPLEMENTED
}

export function writableToReadable<T>({ subscribe }: Writable<T>): Readable<T> {
  return { subscribe: subscribe };
}
