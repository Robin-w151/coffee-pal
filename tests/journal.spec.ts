import type { ActiveJournalEntry } from '$lib/models/journal';
import { expect, test, type Locator, type Page } from '@playwright/test';

class JournalPage {
  constructor(private readonly page: Page) {}

  getJournalList(): Locator {
    return this.page.locator('main dl > div');
  }

  getJournalEntry(entry: number): Locator {
    return this.getJournalList().nth(entry);
  }

  getJournalEntryTitle(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).locator('dt');
  }

  getJournalEntryDetail(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).locator('dd');
  }

  async addJournalEntry({
    method,
    water,
    waterTemperature,
    coffee,
    coffeeType,
    grindSettings,
    description,
  }: ActiveJournalEntry): Promise<void> {
    await this.clickAddButton();
    await this.page.waitForTimeout(150);
    await expect(this.page.getByText('add entry')).toBeVisible();

    const methodInput = this.page.getByLabel('brew method');
    await methodInput.fill(method);
    await methodInput.press('Escape');

    if (coffeeType) {
      const coffeeTypeInput = this.page.getByLabel('type of coffee');
      await coffeeTypeInput.fill(coffeeType);
      await coffeeTypeInput.press('Escape');
    }

    await this.page.getByLabel('amount of water').fill(`${water}`);
    await this.page.getByLabel('amount of coffee').fill(`${coffee}`);
    if (waterTemperature) {
      await this.page.getByLabel('water temperature').fill(`${waterTemperature}`);
    }
    if (grindSettings) {
      await this.page.getByLabel('grind settings').fill(grindSettings);
    }
    if (description) {
      await this.page.getByLabel('description').fill(description);
    }

    await this.clickSaveButton();
    await this.page.waitForTimeout(150);
  }

  async clickAddButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add new entry' }).click();
  }

  async clickSaveButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
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
}

const journalEntries: Array<ActiveJournalEntry> = [
  {
    id: '1860f178-ded7-48fe-89f5-d464be0c698f',
    method: 'PuckPuck',
    water: 500,
    coffee: 38,
    coffeeType: 'Äthiopien Chelbesa',
    grindSettings: '36 clicks',
    description: '20% ice, ~45-60 drops/min, 2.5h brew',
    createdAt: '2023-08-11T10:11:28.556+02:00',
    updatedAt: '2023-09-23T18:45:30.180+02:00',
  },
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
    updatedAt: '2023-08-26T21:44:48.371+02:00',
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

let journalPage: JournalPage;

test.beforeEach(async ({ page }) => {
  await page.goto('/');

  const emptyMessage = page.getByText('could not find any entries');
  await expect(emptyMessage).toBeVisible();

  journalPage = new JournalPage(page);

  for (const entry of journalEntries) {
    await journalPage.addJournalEntry(entry);
  }
});

test('journal list', async () => {
  await expect(journalPage.getJournalList()).toHaveCount(journalEntries.length);
});

test('journal entry item', async () => {
  const firstEntry = journalPage.getJournalEntry(0);
  await expect(journalPage.getJournalEntryTitle(firstEntry)).toHaveText('Aeropress - Terroir PAN');
  await expect(journalPage.getJournalEntryDetail(firstEntry)).toHaveText(
    '1:15.4 - 200g/13g | 100 °C | 24 clicks | 40% ice',
  );
});

test('journal search', async () => {
  await journalPage.enterSearch('PuckPuck');
  await expect(journalPage.getJournalList()).toHaveCount(1);

  await journalPage.clearSearch();
  await expect(journalPage.getJournalList()).toHaveCount(3);
});

test('journal sort', async () => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('Aeropress - Terroir PAN');

  await journalPage.clickSortButton();

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');
});
