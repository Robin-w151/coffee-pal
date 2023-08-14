import type { DateTime } from 'luxon';
import type { Journal, JournalSyncResult } from './journal';

export interface Sync {
  connection?: Connection;
}

export interface SyncState {
  isSynchronizing: boolean;
}

export interface Connection {
  server: Server;
  credentials: Credentials;
  lastSync?: string;
}

export interface Server {
  url: string;
  provider: Provider;
}

export type Provider = 'nextcloud';

export interface Credentials {
  username: string;
  password: string;
}

export interface SyncClient {
  init: () => Promise<void>;
  syncJournal: (journal: Journal, lastSync?: DateTime) => Promise<JournalSyncResult>;
}
