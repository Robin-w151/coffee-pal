import type { Connection, Sync } from '$lib/models/sync';
import { DateTime } from 'luxon';
import { PersistedState } from 'runed';
import { getContext, setContext } from 'svelte';
import { JSON_SERIALIZER, updatePersistedState } from './persisted';

export interface SyncStoreInterface {
  readonly connection: Connection | undefined;
  setConnection: (connection: Connection) => void;
  removeConnection: () => void;
  updateLastSync: () => void;
}

const SYNC_KEY = 'sync';
const DEFAULT_SYNC: Sync = {};

export class SyncStore implements SyncStoreInterface {
  private readonly state = new PersistedState<Sync>(SYNC_KEY, DEFAULT_SYNC, {
    serializer: JSON_SERIALIZER,
  });

  // A plain getter, as in SettingsStore: the scheduled sync reads it from a timer, outside effects.
  get connection(): Connection | undefined {
    return this.state.current.connection;
  }

  setConnection = (connection: Connection): void => {
    updatePersistedState(this.state, (sync) => ({ ...sync, connection }));
  };

  removeConnection = (): void => {
    updatePersistedState(this.state, (sync) => ({ ...sync, connection: undefined }));
  };

  updateLastSync = (): void => {
    updatePersistedState(this.state, (sync) => ({
      ...sync,
      connection: sync.connection
        ? { ...sync.connection, lastSync: DateTime.now().toISO() }
        : undefined,
    }));
  };
}

const DEFAULT_KEY = Symbol('root_sync_store');

export function getSyncStore(key: symbol = DEFAULT_KEY): SyncStoreInterface {
  return getContext(key);
}

export function setSyncStore(key: symbol = DEFAULT_KEY): SyncStoreInterface {
  const syncStore = new SyncStore();
  return setContext(key, syncStore);
}
