import { Observable } from 'rxjs';
import type { Readable, Unsubscriber, Writable } from 'svelte/store';

export function isPresent<T>(value?: T | null): value is T {
  return value != null;
}

export function toObservable<T>(svelteStore: Writable<T> | Readable<T>): Observable<T> {
  let unsubscribe: Unsubscriber;
  const obs = new Observable<T>((subscriber) => {
    unsubscribe = svelteStore.subscribe((val) => {
      subscriber.next(val);
    });

    return () => {
      unsubscribe();
    };
  });

  return obs;
}
