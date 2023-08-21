import type { Credentials, LoginPoll } from '$lib/models/nextcloud';
import {
  isActiveSyncableEntry,
  type ActiveSyncableEntry,
  type Connection,
  type DeletedSyncableEntry,
  type SyncClient,
  type SyncResult,
  type Syncable,
  type SyncableName,
  isDeletedSyncableEntry,
} from '$lib/models/sync';
import { mergeSyncables } from '$lib/utils/sync';
import { DateTime } from 'luxon';
import { createClient, type WebDAVClient } from 'webdav';

const SYNC_DIR = 'CoffeePal';

export interface Login {
  loginUrl: string;
  credentials: Promise<Credentials>;
  abort: () => void;
}

export class NextcloudLoginClient {
  private pollInterval: any;
  private abort = false;

  /* https://docs.nextcloud.com/server/latest/developer_manual/client_apis/LoginFlow/index.html#login-flow-v2 */
  public async login(url: string): Promise<Login> {
    const parsedUrl = new URL(url);
    parsedUrl.pathname = '/index.php/login/v2';

    const loginPoll = await this.initiateLogin(parsedUrl.href);
    const credentials = this.setupLoginPoll(loginPoll);
    const abort = () => (this.abort = true);

    return {
      loginUrl: loginPoll.login,
      credentials,
      abort,
    };
  }

  private async initiateLogin(url: string): Promise<LoginPoll> {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      throw new Error(`Failed to initiale login at nextcloud server url='${url}'!`);
    }

    return response.json();
  }

  private setupLoginPoll(loginPoll: LoginPoll): Promise<Credentials> {
    const start = DateTime.now();
    const hasTimedOut = () => DateTime.now().diff(start, 'minutes').minutes > 10;

    return new Promise((resolve, reject) => {
      this.pollInterval = setInterval(async () => {
        if (this.abort || hasTimedOut()) {
          clearInterval(this.pollInterval);
          reject();
        }

        const credentials = await this.fetchLoginPoll(loginPoll);
        if (credentials) {
          clearInterval(this.pollInterval);
          resolve(credentials);
        }
      }, 5000);
    });
  }

  private async fetchLoginPoll(loginPoll: LoginPoll): Promise<Credentials | null> {
    try {
      const { endpoint, token } = loginPoll.poll;
      const body = new URLSearchParams();
      body.append('token', token);

      const response = await fetch(endpoint, { method: 'POST', body });
      if (!response.ok) {
        return null;
      }

      return response.json();
    } catch (_) {
      return null;
    }
  }
}

export class NextcloudSyncClient implements SyncClient {
  private connection: Connection;
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
    this.client = createClient(webdavUrl.href, this.connection.credentials);
    await this.initSyncDir();
  }

  public async sync<A extends ActiveSyncableEntry, D extends DeletedSyncableEntry>(
    syncable: Syncable<A | D>,
    syncableName: SyncableName,
  ): Promise<SyncResult<A, D>> {
    if (await this.existsSyncable(syncableName)) {
      const remoteSyncable = await this.readSyncable<A, D>(syncableName);
      const {
        localChanges,
        remoteChanges,
        merged: mergedJournal,
      } = mergeSyncables<A, D>(syncable, remoteSyncable);
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
