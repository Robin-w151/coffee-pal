import { scope, type } from 'arktype';

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
    schema: type,
  ) => Promise<SyncResult<A, D>>;
}

export type SyncableName = 'journal' | 'my-coffees';

export const ActiveSyncableEntry = type({
  id: 'string',
  createdAt: 'string.date.iso',
  updatedAt: 'string.date.iso',
});
export type ActiveSyncableEntry = typeof ActiveSyncableEntry.infer;

export const DeletedSyncableEntry = type({
  id: 'string',
  deletedAt: 'string.date.iso',
});
export type DeletedSyncableEntry = typeof DeletedSyncableEntry.infer;

export const SyncableEntry = type(ActiveSyncableEntry).or(DeletedSyncableEntry);
export type SyncableEntry = typeof SyncableEntry.infer;

const syncableScope = scope({
  SyncableEntry,
});
export const Syncable = syncableScope.type('<T extends SyncableEntry>', {
  entries: 'T[]',
});
export interface Syncable<T extends SyncableEntry> {
  entries: T[];
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
