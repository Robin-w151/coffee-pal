import type { ActiveJournalEntry, DeletedJournalEntry, Journal } from '$lib/models/journal';
import type { ActiveCoffeeEntry, DeletedCoffeeEntry, MyCoffees } from '$lib/models/myCoffees';
import type { Connection, SyncClient, SyncResult } from '$lib/models/sync';
import { NextcloudSyncClient } from './nextcloud';

export async function syncJournal(
  connection: Connection,
  journal: Journal,
): Promise<SyncResult<ActiveJournalEntry, DeletedJournalEntry>> {
  const client = await initSyncClient(connection);
  return await client.sync<ActiveJournalEntry, DeletedJournalEntry>(journal, 'journal');
}

export async function syncMyCoffees(
  connection: Connection,
  myCoffees: MyCoffees,
): Promise<SyncResult<ActiveCoffeeEntry, DeletedCoffeeEntry>> {
  const client = await initSyncClient(connection);
  return await client.sync<ActiveCoffeeEntry, DeletedCoffeeEntry>(myCoffees, 'my-coffees');
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
