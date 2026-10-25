import { expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test } from '../fixtures';

test('appearence system', async ({ page, settingsPage }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await settingsPage.getAppearenceOption('System').click();
  await settingsPage.goto();

  await expect(settingsPage.activeAppearenceOption).toHaveText('System');
  await expect(page.locator('html')).toHaveClass('dark');
});

test('appearence light', async ({ page, settingsPage }) => {
  await settingsPage.getAppearenceOption('Light').click();
  await settingsPage.goto();

  await expect(settingsPage.activeAppearenceOption).toHaveText('Light');
  await expect(page.locator('html')).not.toHaveClass('dark');
});

test('appearence dark', async ({ page, settingsPage }) => {
  await settingsPage.getAppearenceOption('Dark').click();
  await settingsPage.goto();

  await expect(settingsPage.activeAppearenceOption).toHaveText('Dark');
  await expect(page.locator('html')).toHaveClass('dark');
});

test('units metric', async ({ settingsPage }) => {
  await settingsPage.getUnitsOptions('Metric').click();
  await settingsPage.goto();

  await expect(settingsPage.activeUnitsOption).toHaveText('Metric');
});

test('units imperial', async ({ settingsPage }) => {
  await settingsPage.getUnitsOptions('Imperial').click();
  await settingsPage.goto();

  await expect(settingsPage.activeUnitsOption).toHaveText('Imperial');
});

test('appearence radio group marks one option', async ({ settingsPage }) => {
  await settingsPage.getAppearenceOption('Light').click();
  await expect(settingsPage.activeAppearenceOption).toHaveCount(1);
  await expect(settingsPage.activeAppearenceOption).toHaveText('Light');

  await settingsPage.getAppearenceOption('Dark').click();
  await expect(settingsPage.activeAppearenceOption).toHaveCount(1);
  await expect(settingsPage.activeAppearenceOption).toHaveText('Dark');
});

test('server url input builds the url from scheme and host', async ({ settingsPage }) => {
  await settingsPage.serverUrlInput.fill('cloud.example.test');
  await expect(settingsPage.openServerUrlLink).toHaveAttribute(
    'href',
    'https://cloud.example.test',
  );

  await settingsPage.serverSchemeSelect.selectOption('http:');
  await expect(settingsPage.openServerUrlLink).toHaveAttribute('href', 'http://cloud.example.test');
});

test.describe('backup import', () => {
  test('imports journal and coffee entries', async ({
    page,
    appPage,
    settingsPage,
    journalPage,
    myCoffeesPage,
  }) => {
    const backup = readBackupFixture();
    await settingsPage.goto();
    await settingsPage.backupFileInput.setInputFiles(backupFixturePath);
    await settingsPage.clickImportButton();
    await expect(
      appPage.toast.filter({ hasText: 'Importing backup data was successful' }),
    ).toBeVisible();

    await journalPage.goto();
    const newestJournalEntry = newest(backup.journal.entries);
    await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
      `${newestJournalEntry.method} - ${coffeeLabel(newestJournalEntry.coffeeType)}`,
    );
    await journalPage.getPaginatorButton('Last').click();
    await expect(journalPage.journalList).toHaveCount((backup.journal.entries.length + 3) % 20);

    await myCoffeesPage.goto();
    await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText(
      coffeeLabel(newest(backup.myCoffees.entries)),
    );
    await page.getByRole('button', { name: 'Last page', exact: true }).click();
    await expect(myCoffeesPage.coffeeList).toHaveCount((backup.myCoffees.entries.length + 3) % 20);
  });

  test('shows an error for a malformed file', async ({ appPage, settingsPage }) => {
    await settingsPage.backupFileInput.setInputFiles({
      name: 'broken-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"journal": {"entries": [{"id": 1}]}}'),
    });
    await settingsPage.clickImportButton();

    await expect(appPage.toast.filter({ hasText: 'Importing backup data failed' })).toBeVisible();
  });
});

const backupFixturePath = fileURLToPath(new URL('../fixtures/backup-import.json', import.meta.url));

interface BackupFixtureCoffee {
  name: string;
  roaster?: string;
  trader?: string;
  updatedAt: string;
}

interface BackupFixture {
  journal: {
    entries: Array<{ method: string; coffeeType: BackupFixtureCoffee; updatedAt: string }>;
  };
  myCoffees: { entries: Array<BackupFixtureCoffee> };
}

function readBackupFixture(): BackupFixture {
  return JSON.parse(readFileSync(backupFixturePath, 'utf-8'));
}

function newest<T extends { updatedAt: string }>(entries: Array<T>): T {
  return entries.reduce((a, b) => (Date.parse(b.updatedAt) > Date.parse(a.updatedAt) ? b : a));
}

function coffeeLabel({ name, roaster, trader }: BackupFixtureCoffee): string {
  const source = roaster || trader;
  return source ? `${name} (${source})` : name;
}
