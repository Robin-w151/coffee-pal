import { describe, expect, test } from 'vitest';
import { isPresent, toObservable } from './observables';
import { writable } from 'svelte/store';

describe('isPresent', () => {
  test.each([
    {
      value: undefined,
      expected: false,
    },
    {
      value: null,
      expected: false,
    },
    {
      value: 0,
      expected: true,
    },
    {
      value: '',
      expected: true,
    },
  ])('value == $value', ({ value, expected }) => {
    expect(isPresent(value)).toBe(expected);
  });
});

describe('toObservable', () => {
  test('convert store to observable', () => {
    const store = writable(0);
    const observable = toObservable(store);

    let count = 0;
    let lastValue = null;
    const subscription = observable.subscribe((value) => {
      count++;
      lastValue = value;
    });

    store.set(1);
    store.set(2);
    store.set(3);

    subscription.unsubscribe();

    store.set(4);

    expect(count).toBe(4);
    expect(lastValue).toBe(3);
  });
});
