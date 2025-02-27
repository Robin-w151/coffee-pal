import type { ZodSchema } from 'zod';

export interface Sync {
  connection?: Connection;
}

export interface SyncState {
  isSynchronizing: boolean;
}

export interface SyncAvailability {
  isAvailable: boolean;
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
  sync: <A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
    syncable: any,
    syncableName: SyncableName,
    schema: ZodSchema,
  ) => Promise<SyncResult<A, D>>;
}

export type SyncableName = 'journal' | 'my-coffees';

export interface Syncable<T extends SyncableEntry> {
  entries: Array<T>;
}

export type SyncableEntry = ActiveSyncableEntry | DeletedSyncableEntry;

export interface ActiveSyncableEntry {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeletedSyncableEntry {
  id: string;
  deletedAt: string;
}

export interface SyncResult<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry> {
  updateEntries: Array<A>;
  deleteEntries: Array<D>;
}

export interface SyncMergeResult<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry> {
  localChanges: SyncResult<A, D>;
  remoteChanges: SyncResult<A, D>;
  merged: Syncable<A | D>;
}

export function isActiveSyncableEntry(entry?: SyncableEntry | null): entry is ActiveSyncableEntry {
  return (entry as ActiveSyncableEntry)?.createdAt !== undefined;
}

export function isDeletedSyncableEntry(
  entry?: SyncableEntry | null,
): entry is DeletedSyncableEntry {
  return (entry as DeletedSyncableEntry)?.deletedAt !== undefined;
}
