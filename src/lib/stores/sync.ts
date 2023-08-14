import type { Connection, Sync } from '$lib/models/sync';
import { localStorageStore } from '@skeletonlabs/skeleton';
import { DateTime } from 'luxon';
import type { Readable } from 'svelte/store';

export interface SyncStore extends Readable<Sync> {
  setConnection: (connection: Connection) => void;
  removeConnection: () => void;
  updateLastSync: () => void;
}

const SYNC_STORE_NAME = 'sync';

const initialState: Sync = {};
const { subscribe, update } = localStorageStore<Sync>(SYNC_STORE_NAME, initialState);

function setConnection(connection: Connection): void {
  update((sync) => ({ ...sync, connection }));
}

function removeConnection(): void {
  update((sync) => ({ ...sync, connection: undefined }));
}

function updateLastSync(): void {
  update((sync) => ({
    ...sync,
    connection: sync.connection
      ? { ...sync.connection, lastSync: DateTime.now().toISO()! }
      : undefined,
  }));
}

export const syncStore = {
  subscribe,
  setConnection,
  removeConnection,
  updateLastSync,
};
