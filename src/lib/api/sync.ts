import type { Journal, JournalSyncResult } from '$lib/models/journal';
import type { Connection, SyncClient } from '$lib/models/sync';
import { DateTime } from 'luxon';
import { NextcloudSyncClient } from './nextcloud';

export async function syncJournal(
  connection: Connection,
  journal: Journal,
): Promise<JournalSyncResult> {
  const client = await initSyncClient(connection);
  const lastSync = connection.lastSync ? DateTime.fromISO(connection.lastSync) : undefined;
  return await client.syncJournal(journal, lastSync);
}

async function initSyncClient(connection: Connection): Promise<SyncClient> {
  switch (connection.server.provider) {
    case 'nextcloud': {
      const client = new NextcloudSyncClient(connection);
      await client.init();
      return client;
    }
  }
}
