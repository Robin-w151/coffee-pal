import type { ActiveJournalEntry, DeletedJournalEntry, JournalEntry } from '$lib/models/journal';
import type { ActiveCoffeeEntry, CoffeeEntry, DeletedCoffeeEntry } from '$lib/models/myCoffees';
import type { Connection, SyncClient, SyncResult } from '$lib/models/sync';
import { NextcloudSyncClient } from './nextcloud';

export async function syncJournal(
  connection: Connection,
  entries: Array<JournalEntry>,
): Promise<SyncResult<ActiveJournalEntry, DeletedJournalEntry>> {
  const client = await initSyncClient(connection);
  return await client.sync<ActiveJournalEntry, DeletedJournalEntry>({ entries }, 'journal');
}

export async function syncMyCoffees(
  connection: Connection,
  entries: Array<CoffeeEntry>,
): Promise<SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>> {
  const client = await initSyncClient(connection);
  return await client.sync<ActiveCoffeeEntry, DeletedCoffeeEntry>({ entries }, 'my-coffees');
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
