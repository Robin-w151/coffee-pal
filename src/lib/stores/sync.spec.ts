// @vitest-environment jsdom
import type { Connection } from '$lib/models/sync';
import { DateTime } from 'luxon';
import { beforeEach, describe, expect, test } from 'vitest';
import { legacyStorage } from '../../../tests/fixtures/legacy-storage';
import { SyncStore } from './sync.svelte';

const legacyConnection: Connection = JSON.parse(legacyStorage.sync).connection;

describe('SyncStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('reads a value written by the Skeleton v2 store', () => {
    localStorage.setItem('sync', legacyStorage.sync);

    const store = new SyncStore();

    expect(store.connection).toEqual(legacyConnection);
  });

  test('has no connection without a stored value', () => {
    expect(new SyncStore().connection).toBeUndefined();
  });

  test('writes the same JSON as the Skeleton v2 store', () => {
    const store = new SyncStore();

    store.setConnection(legacyConnection);

    expect(localStorage.getItem('sync')).toBe(legacyStorage.sync);
  });

  test('updates the last sync time', () => {
    localStorage.setItem('sync', legacyStorage.sync);
    const store = new SyncStore();
    const before = DateTime.now();

    store.updateLastSync();

    const lastSync = DateTime.fromISO(store.connection?.lastSync ?? '');
    expect(lastSync >= before.startOf('second')).toBe(true);
    expect(store.connection?.server).toEqual(legacyConnection.server);
  });

  test('removes the connection', () => {
    localStorage.setItem('sync', legacyStorage.sync);
    const store = new SyncStore();

    store.removeConnection();

    expect(store.connection).toBeUndefined();
    expect(localStorage.getItem('sync')).toBe('{}');
  });
});
