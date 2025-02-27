import type { Credentials, LoginPoll } from '$lib/models/nextcloud';
import {
  isActiveSyncableEntry,
  isDeletedSyncableEntry,
  type ActiveSyncableEntry,
  type Connection,
  type DeletedSyncableEntry,
  type SyncClient,
  type SyncResult,
  type Syncable,
  type SyncableName,
} from '$lib/models/sync';
import { merge } from '$lib/services/sync/merge';
import { isPresent } from '$lib/shared/observables';
import {
  catchError,
  filter,
  first,
  interval,
  of,
  switchMap,
  tap,
  throwError,
  timeout,
  type Observable,
} from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import type { WebDAVClient } from 'webdav';
import type { ZodSchema } from 'zod';
import { isValid } from '../validation/validation';

const SYNC_DIR = 'CoffeePal';

const createClient = (async () => (await import('webdav')).createClient)();

export class NextcloudLoginClient {
  /* https://docs.nextcloud.com/server/latest/developer_manual/client_apis/LoginFlow/index.html#login-flow-v2 */
  public login(url: string, urlHandler: (loginUrl: string) => void): Observable<Credentials> {
    const parsedUrl = new URL(url);
    parsedUrl.pathname = '/index.php/login/v2';

    return this.initiateLogin(parsedUrl.href).pipe(
      tap((loginPoll) => urlHandler(loginPoll.login)),
      switchMap((loginPoll) => this.setupLoginPoll(loginPoll)),
    );
  }

  private initiateLogin(url: string): Observable<LoginPoll> {
    return fromFetch(url, { method: 'POST' }).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        }

        return throwError(() => new Error('Cannot retrieve login instructions.'));
      }),
    );
  }

  private setupLoginPoll(loginPoll: LoginPoll): Observable<Credentials> {
    return interval(5000).pipe(
      switchMap(() => this.fetchLoginPoll(loginPoll)),
      filter(isPresent),
      first(),
      timeout(600_000),
    );
  }

  private fetchLoginPoll(loginPoll: LoginPoll): Observable<Credentials | null> {
    const { endpoint, token } = loginPoll.poll;
    const body = new URLSearchParams();
    body.append('token', token);

    return fromFetch(endpoint, { method: 'POST', body }).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        }

        return of(null);
      }),
      catchError(() => of(null)),
    );
  }
}

export class NextcloudSyncClient implements SyncClient {
  private readonly connection: Connection;
  private client!: WebDAVClient;

  constructor(connection: Connection) {
    if (connection.server.provider !== 'nextcloud') {
      throw new Error(
        `Failed to init nextcloud sync client for different provider='${connection.server.provider}'!`,
      );
    }
    this.connection = connection;
  }

  public async init(): Promise<void> {
    const webdavUrl = new URL(this.connection.server.url);
    webdavUrl.pathname = '/remote.php/dav';
    this.client = (await createClient)(webdavUrl.href, this.connection.credentials);
    await this.initSyncDir();
  }

  public async sync<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
    syncable: Syncable<A | D>,
    syncableName: SyncableName,
    schema: ZodSchema,
  ): Promise<SyncResult<A, D>> {
    if (await this.existsSyncable(syncableName)) {
      const remoteSyncable = await this.readSyncable<A, D>(syncableName);
      if (!(await isValid(schema, remoteSyncable))) {
        throw new Error(`Remote syncable '${syncableName}' is invalid!`);
      }

      const {
        localChanges,
        remoteChanges,
        merged: mergedJournal,
      } = merge<A, D>(syncable, remoteSyncable);
      if (this.hasChanges(remoteChanges)) {
        await this.writeSyncable(mergedJournal, syncableName);
      }
      return localChanges;
    } else {
      const activeEntries = syncable.entries.filter(isActiveSyncableEntry);
      const deletedEntries = syncable.entries.filter(isDeletedSyncableEntry) as Array<D>;
      await this.writeSyncable({ ...syncable, entries: activeEntries }, syncableName);
      return { updateEntries: [], deleteEntries: deletedEntries };
    }
  }

  private async initSyncDir(): Promise<void> {
    const syncDirExists = await this.client.exists(this.getSyncDir());
    if (!syncDirExists) {
      await this.client.createDirectory(this.getSyncDir());
    }
  }

  private getSyncDir(): string {
    return `/files/${this.connection.credentials.username}/${SYNC_DIR}`;
  }

  private getSyncFile(syncableName: SyncableName): string {
    return `${this.getSyncDir()}/${syncableName}.json`;
  }

  private existsSyncable(syncableName: SyncableName): Promise<boolean> {
    const path = this.getSyncFile(syncableName);
    return this.client.exists(path);
  }

  private async readSyncable<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
    syncableName: SyncableName,
  ): Promise<Syncable<A | D>> {
    const path = this.getSyncFile(syncableName);
    return JSON.parse((await this.client.getFileContents(path, { format: 'text' })) as string);
  }

  private async writeSyncable<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
    syncable: Syncable<A | D>,
    syncableName: SyncableName,
  ): Promise<void> {
    const path = this.getSyncFile(syncableName);
    await this.client.putFileContents(path, JSON.stringify(syncable), {
      overwrite: true,
    });
  }

  private hasChanges<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
    syncResult: SyncResult<A, D>,
  ): boolean {
    return syncResult.updateEntries.length > 0 || syncResult.deleteEntries.length > 0;
  }
}
