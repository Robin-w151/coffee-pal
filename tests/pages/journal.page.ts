import type { ActiveJournalEntry } from '$lib/models/journal';
import type { Locator, Page } from 'playwright/test';

export class JournalPage {
  constructor(private readonly page: Page) {}

  get journalList(): Locator {
    return this.page.locator('main dl > div');
  }

  get emptyMessage(): Locator {
    return this.page.getByText('could not find any entries');
  }

  getJournalEntry(entry: number): Locator {
    return this.journalList.nth(entry);
  }

  getJournalEntryTitle(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).locator('dt');
  }

  getJournalEntryDetail(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).locator('dd');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async addJournalEntries(entries: Array<ActiveJournalEntry>): Promise<void> {
    await this.page.evaluate(async (entries) => {
      return new Promise((resolve, reject) => {
        console.log(entries);
        const openRequest = window.indexedDB.open('journal');
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
    await this.page.getByRole('button', { name: 'Change sort order' }).click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async clickUndoButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Undo' }).click();
  }

  async clickJournalEntryShowButton(entry: Locator | number): Promise<void> {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry)
      .getByTitle('Show')
      .click();
  }
}

export const testJournalEntries: Array<ActiveJournalEntry> = [
  {
    id: '1c3897d0-0b79-480c-a953-9ce9224bb8f0',
    method: 'Aeropress',
    water: 200,
    waterTemperature: 100,
    coffee: 13,
    coffeeType: 'Terroir PAN',
    grindSettings: '24 clicks',
    description: '40% ice',
    createdAt: '2023-08-26T21:44:48.371+02:00',
    updatedAt: '2023-12-26T21:44:48.371+02:00',
  },
  {
    id: '1860f178-ded7-48fe-89f5-d464be0c698f',
    method: 'PuckPuck',
    water: 500,
    coffee: 38,
    coffeeType: 'Äthiopien Chelbesa',
    grindSettings: '36 clicks',
    description: '20% ice, ~45-60 drops/min, 2.5h brew',
    createdAt: '2023-08-11T10:11:28.556+02:00',
    updatedAt: '2023-11-23T18:45:30.180+02:00',
  },
  {
    id: '20c94b21-0426-44ff-91a8-9e49ae54e04c',
    method: 'V60 Switch',
    water: 380,
    waterTemperature: 100,
    coffee: 25,
    coffeeType: 'Honeymoon',
    grindSettings: '24 clicks',
    description: '2m30s brew',
    createdAt: '2023-10-01T19:32:09.015+02:00',
    updatedAt: '2023-10-01T19:32:09.015+02:00',
  },
];
