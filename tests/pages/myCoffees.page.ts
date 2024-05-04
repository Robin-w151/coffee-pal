import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
import type { Locator, Page } from '@playwright/test';

export class MyCoffeesPage {
  constructor(private readonly page: Page) {}

  get coffeeList(): Locator {
    return this.page.locator('main dl > div');
  }

  get emptyMessage(): Locator {
    return this.page.getByText('could not find any coffees').first();
  }

  getCoffeeEntry(entry: number): Locator {
    return this.coffeeList.nth(entry);
  }

  getCoffeeEntryTitle(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getCoffeeEntry(entry) : entry).locator('dt');
  }

  getCoffeeEntryDetail(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getCoffeeEntry(entry) : entry).locator('dd');
  }

  async goto(): Promise<void> {
    await this.page.goto('/my-coffees');
  }

  async addCoffeeEntry(entries: Array<ActiveCoffeeEntry>): Promise<void> {
    await this.page.evaluate(async (entries) => {
      return new Promise((resolve, reject) => {
        const openRequest = window.indexedDB.open('my-coffees');
        openRequest.onsuccess = (event: any) => {
          const db = event.target.result as IDBDatabase;
          const tx = db.transaction(['entries'], 'readwrite');
          entries.forEach((entry) => tx.objectStore('entries').add(entry));

          tx.commit();
          tx.oncomplete = resolve;
          tx.onerror = reject;
          tx.onabort = reject;
        };
        openRequest.onerror = reject;
      });
    }, entries);
  }

  async clickAddButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add new entry' }).click();
  }

  async enterSearch(search: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.getByPlaceholder('Search...').fill(search);
  }

  async clearSearch(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clear' }).click();
  }

  async clickSortButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Change sort order' }).click();
  }

  async clickSortOption(option: 'A-Z' | 'Z-A' | 'Latest'): Promise<void> {
    await this.page.getByRole('option', { name: option }).click();
  }

  async clickUndoButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Undo' }).click();
  }

  async clickJournalEntryShowButton(entry: Locator | number): Promise<void> {
    return (typeof entry === 'number' ? this.getCoffeeEntry(entry) : entry)
      .getByTitle('Show')
      .click();
  }
}

export const testCoffeeEntries: Array<ActiveCoffeeEntry> = [
  {
    id: '1bdfaa18-8722-439f-b26b-caa7f67fed00',
    name: 'Rwanda Kamajumba',
    origin: 'Kamajumba Estate',
    process: 'Washed',
    variety: 'Red Bourbon',
    roaster: 'Drip Roasters',
    trader: 'Drip Roasters',
    aromas: ['lemon', 'orange', 'black tea'],
    createdAt: '2023-08-26T21:29:31.780+02:00',
    updatedAt: '2023-10-26T21:29:31.780+02:00',
  },
  {
    id: '191ee4a7-a43d-4a43-98e3-9e5861106d86',
    name: 'Terroir PAN',
    origin: 'Panama',
    process: 'Washed',
    roaster: 'Rösterei',
    trader: 'Blasercafe',
    aromas: ['blueberry', 'caramel', 'floral', 'sweet', 'honey'],
    createdAt: '2023-08-26T21:26:11.665+02:00',
    updatedAt: '2023-09-28T15:09:57.359+02:00',
  },
  {
    id: '0f3bb076-7346-44fb-8c1d-d74a8c691441',
    name: 'Wiedner Mischung',
    origin: 'Mix',
    process: 'Washed',
    variety: 'Arabica',
    roaster: 'Alt Wien',
    trader: 'Alt Wien',
    aromas: ['cocoa', 'caramel', 'walnut', 'black tea', 'nut meg', 'pepper', 'marzipan'],
    createdAt: '2023-09-14T16:19:42.679+02:00',
    updatedAt: '2023-09-14T18:30:27.456+02:00',
  },
];
