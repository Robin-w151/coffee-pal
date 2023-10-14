import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('journal list', async ({ journalPage }) => {
  await expect(journalPage.journalList).toHaveCount(3);
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
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('PuckPuck - Äthiopien Chelbesa');
});

test('journal search clear', async ({ journalPage }) => {
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

test('journal entry add', async ({ page, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickAddButton();
  await expect(journalEntryDetailPage.header).toBeVisible();

  await journalEntryDetailPage.methodInput.fill('Chemex');
  await journalEntryDetailPage.methodInput.press('Escape');
  await journalEntryDetailPage.coffeeTypeInput.fill('Tovolea Classic');
  await journalEntryDetailPage.coffeeTypeInput.press('Escape');
  await journalEntryDetailPage.waterInput.fill('510');
  await journalEntryDetailPage.coffeeInput.fill('30');
  await journalEntryDetailPage.waterTemperatureInput.fill('98');
  await journalEntryDetailPage.grindSettingsInput.fill('24 clicks');
  await journalEntryDetailPage.descriptionInput.fill('Nutty and smoky');

  await journalEntryDetailPage.clickSaveButton();
  await page.waitForTimeout(150);

  const entry = journalPage.getJournalEntry(1);
  await expect(journalPage.getJournalEntryTitle(entry)).toHaveText('Chemex - Tovolea Classic');
  await expect(journalPage.getJournalEntryDetail(entry)).toHaveText(
    '1:17 - 510g/30g | 98 °C | 24 clicks | Nutty and smoky',
  );
});

test('journal entry edit', async ({ page, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryEditButton(0);
  await journalEntryDetailPage.methodInput.fill('Aeropress Clear');
  await journalEntryDetailPage.clickSaveButton();
  await page.waitForTimeout(150);

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('Aeropress Clear - Terroir PAN');
});

test('journal entry delete', async ({ page, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryEditButton(0);
  await journalEntryDetailPage.clickDeleteButton();
  await page.waitForTimeout(150);

  await expect(journalPage.journalList).toHaveCount(2);
});

test('journal entry delete undo', async ({ page, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryEditButton(0);
  await journalEntryDetailPage.clickDeleteButton();
  await page.waitForTimeout(150);
  await journalPage.clickUndoButton();

  await expect(journalPage.journalList).toHaveCount(3);
});

test('journal entry repeat', async ({ page, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryRepeatButton(0);
  await journalEntryDetailPage.methodInput.fill('Aeropress Clear');
  await journalEntryDetailPage.clickSaveButton();
  await page.waitForTimeout(150);

  await expect(journalPage.journalList).toHaveCount(4);
});
