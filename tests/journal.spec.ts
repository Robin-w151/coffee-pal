import { expect } from '@playwright/test';
import { test } from './page/fixtures';
import { testJournalEntries } from './page/journal.page';

test('journal list', async ({ journalPage }) => {
  await expect(journalPage.journalList).toHaveCount(testJournalEntries.length);
});

test('journal entry item', async ({ journalPage }) => {
  const firstEntry = journalPage.getJournalEntry(0);
  await expect(journalPage.getJournalEntryTitle(firstEntry)).toHaveText('Aeropress - Terroir PAN');
  await expect(journalPage.getJournalEntryDetail(firstEntry)).toHaveText(
    '1:15.4 - 200g/13g | 100 °C | 24 clicks | 40% ice',
  );
});

test('journal search', async ({ journalPage }) => {
  await journalPage.enterSearch('PuckPuck');
  await expect(journalPage.journalList).toHaveCount(1);

  await journalPage.clearSearch();
  await expect(journalPage.journalList).toHaveCount(3);
});

test('journal sort', async ({ journalPage }) => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('Aeropress - Terroir PAN');

  await journalPage.clickSortButton();

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');
});
