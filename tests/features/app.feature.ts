import type { ActiveJournalEntry } from '$lib/models/journal';
import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
import type { Locator, Page } from '@playwright/test';

export class AppPage {
  constructor(private readonly page: Page) {}

  get warningDialog(): Locator {
    return this.page.locator('.modal');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async clickWarningCancelButton(): Promise<void> {
    await this.warningDialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async clickWarningConfirmButton(): Promise<void> {
    await this.warningDialog.getByRole('button', { name: 'Confirm' }).click();
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

  async addCoffeeEntries(entries: Array<ActiveCoffeeEntry>): Promise<void> {
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
}

export const testJournalEntries: Array<ActiveJournalEntry> = [
  {
    id: '1c3897d0-0b79-480c-a953-9ce9224bb8f0',
    method: 'Aeropress',
    water: 200,
    waterTemperature: 100,
    coffee: 13,
    coffeeType: {
      id: '191ee4a7-a43d-4a43-98e3-9e5861106d86',
      name: 'Terroir PAN',
      origin: 'Panama',
      process: 'Washed',
      variety: undefined,
      roaster: 'Rösterei',
      trader: 'Blasercafe',
      rating: undefined,
      aromas: ['blueberry', 'caramel', 'floral', 'sweet', 'honey'],
      description: undefined,
      createdAt: '2023-08-26T21:26:11.665+02:00',
      updatedAt: '2023-09-28T15:09:57.359+02:00',
    },
    grindSettings: '24 clicks',
    rating: 3,
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
    rating: 5,
    description: undefined,
    createdAt: '2023-10-01T19:32:09.015+02:00',
    updatedAt: '2023-10-01T19:32:09.015+02:00',
  },
];

export const testCoffeeEntries: Array<ActiveCoffeeEntry> = [
  {
    id: '1bdfaa18-8722-439f-b26b-caa7f67fed00',
    name: 'Rwanda Kamajumba',
    origin: 'Kamajumba Estate',
    process: 'Washed',
    variety: 'Red Bourbon',
    roaster: 'Drip Roasters',
    trader: 'Drip Roasters',
    rating: undefined,
    aromas: ['lemon', 'orange', 'black tea'],
    description: undefined,
    createdAt: '2023-08-26T21:29:31.780+02:00',
    updatedAt: '2023-10-26T21:29:31.780+02:00',
  },
  {
    id: '191ee4a7-a43d-4a43-98e3-9e5861106d86',
    name: 'Terroir PAN',
    origin: 'Panama',
    process: 'Washed',
    variety: undefined,
    roaster: 'Rösterei',
    trader: 'Blasercafe',
    rating: 4,
    aromas: ['blueberry', 'caramel', 'floral', 'sweet', 'honey'],
    description: undefined,
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
    rating: 2,
    aromas: ['cocoa', 'caramel', 'walnut', 'black tea', 'nut meg', 'pepper', 'marzipan'],
    description: undefined,
    createdAt: '2023-09-14T16:19:42.679+02:00',
    updatedAt: '2023-09-14T18:30:27.456+02:00',
  },
];
