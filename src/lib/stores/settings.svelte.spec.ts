// @vitest-environment jsdom
import { flushSync } from 'svelte';
import { beforeEach, describe, expect, test } from 'vitest';
import { legacyStorage } from '../../../tests/fixtures/legacy-storage';
import { SettingsStore } from './settings.svelte';

describe('SettingsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('reads a value written by the Skeleton v2 store', () => {
    localStorage.setItem('settings', legacyStorage.settings);

    const store = new SettingsStore();

    expect(store.colorScheme).toBe('dark');
    expect(store.preferredUnits).toBe('imperial');
  });

  test('uses the defaults without a stored value', () => {
    const store = new SettingsStore();

    expect(store.colorScheme).toBe('system');
    expect(store.preferredUnits).toBe('metric');
  });

  test.each([
    ['an unknown colour scheme', '{"colorScheme":"pink","preferredUnits":"imperial"}', 'imperial'],
    ['unknown units', '{"colorScheme":"system","preferredUnits":"furlongs"}', 'metric'],
    ['invalid JSON', '{colorScheme', 'metric'],
    ['JSON null', 'null', 'metric'],
  ])('sanitises %s', (_name, stored, expectedUnits) => {
    localStorage.setItem('settings', stored);

    const store = new SettingsStore();

    expect(store.colorScheme).toBe('system');
    expect(store.preferredUnits).toBe(expectedUnits);
  });

  test('writes the same JSON as the Skeleton v2 store', () => {
    const store = new SettingsStore();

    store.setColorScheme('dark');
    store.setPreferredUnits('imperial');

    expect(localStorage.getItem('settings')).toBe(legacyStorage.settings);
    expect(store.colorScheme).toBe('dark');
    expect(store.preferredUnits).toBe('imperial');
  });

  test('can be written from an effect without the effect depending on it', () => {
    const store = new SettingsStore();
    let runs = 0;

    const cleanup = $effect.root(() => {
      $effect(() => {
        runs += 1;
        store.setColorScheme('light');
      });
    });
    flushSync();
    store.setPreferredUnits('imperial');
    flushSync();
    cleanup();

    expect(runs).toBe(1);
    expect(store.colorScheme).toBe('light');
  });
});
