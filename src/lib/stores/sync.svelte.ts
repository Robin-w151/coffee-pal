import type { Connection, Sync } from '$lib/models/sync';
import { DateTime } from 'luxon';
import { PersistedState } from 'runed';
import { getContext, setContext, untrack } from 'svelte';
import { JSON_SERIALIZER } from './persisted';

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
    this.update((sync) => ({ ...sync, connection }));
  };

  removeConnection = (): void => {
    this.update((sync) => ({ ...sync, connection: undefined }));
  };

  updateLastSync = (): void => {
    this.update((sync) => ({
      ...sync,
      connection: sync.connection
        ? { ...sync.connection, lastSync: DateTime.now().toISO() }
        : undefined,
    }));
  };

  // Untracked as a whole: setters are called from effects, and reading the PersistedState proxy
  // (also when spreading it) would make the effect depend on the value it writes.
  private update(updater: (sync: Sync) => Sync): void {
    untrack(() => {
      this.state.current = updater(this.state.current);
    });
  }
}

const DEFAULT_KEY = Symbol('root_sync_store');

export function getSyncStore(key: symbol = DEFAULT_KEY): SyncStoreInterface {
  return getContext(key);
}

export function setSyncStore(key: symbol = DEFAULT_KEY): SyncStoreInterface {
  const syncStore = new SyncStore();
  return setContext(key, syncStore);
}
