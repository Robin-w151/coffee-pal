import type { Journal, JournalSyncResult } from '$lib/models/journal';
import type { Credentials, LoginPoll } from '$lib/models/nextcloud';
import type { Connection, SyncClient } from '$lib/models/sync';
import { DateTime } from 'luxon';
import { createClient, type WebDAVClient } from 'webdav';
import { mergeJournals } from './cloud-sync';

const SYNC_DIR = 'CoffeePal';
const SYNC_JOURNAL = 'journal.json';

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

  public async syncJournal(journal: Journal): Promise<JournalSyncResult> {
    if (!(await this.existsJournal())) {
      await this.writeJournal(journal);
      return { updateEntries: [], deleteEntries: [] };
    } else {
      const remoteJournal = await this.readJournal();
      const { localChanges, remoteChanges, mergedJournal } = mergeJournals(journal, remoteJournal);
      if (this.hasChanges(remoteChanges)) {
        await this.writeJournal(mergedJournal);
      }
      return localChanges;
    }
  }

  private async initSyncDir(): Promise<void> {
    const syncDirExists = await this.client!.exists(this.getSyncDir());
    if (!syncDirExists) {
      await this.client.createDirectory(this.getSyncDir());
    }
  }

  private getSyncDir(): string {
    return `/files/${this.connection.credentials.username}/${SYNC_DIR}`;
  }

  private getSyncFile(filename: string): string {
    return `${this.getSyncDir()}/${filename}`;
  }

  private getJournalPath(): string {
    return this.getSyncFile(SYNC_JOURNAL);
  }

  private async existsJournal(): Promise<boolean> {
    const path = this.getJournalPath();
    return this.client.exists(path);
  }

  private async readJournal(): Promise<Journal> {
    const path = this.getJournalPath();
    return JSON.parse((await this.client.getFileContents(path, { format: 'text' })) as string);
  }

  private async writeJournal(journal: Journal): Promise<void> {
    const path = this.getJournalPath();
    await this.client.putFileContents(path, JSON.stringify(journal), {
      overwrite: true,
    });
  }

  private hasChanges(syncResult: JournalSyncResult): boolean {
    return syncResult.updateEntries.length > 0 || syncResult.deleteEntries.length > 0;
  }
}
