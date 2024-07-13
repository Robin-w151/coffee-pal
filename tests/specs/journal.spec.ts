import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('list', async ({ journalPage }) => {
  await expect(journalPage.journalList).toHaveCount(3);
});

test('entry item', async ({ journalPage }) => {
  const firstEntry = journalPage.getJournalEntry(0);
  await expect(journalPage.getJournalEntryTitle(firstEntry)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );
  await expect(journalPage.getJournalEntryDetail(firstEntry)).toHaveText(
    '1:15.4 - 200g/13g | 100 °C | 24 clicks | 40% ice',
  );
});

test('search', async ({ journalPage }) => {
  await journalPage.enterSearch('PuckPuck');
  await expect(journalPage.journalList).toHaveCount(1);
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('PuckPuck - Äthiopien Chelbesa');
});

test('search clear', async ({ journalPage }) => {
  await journalPage.enterSearch('PuckPuck');
  await expect(journalPage.journalList).toHaveCount(1);

  await journalPage.clearSearch();
  await expect(journalPage.journalList).toHaveCount(3);
});

test('sort', async ({ journalPage }) => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );

  await journalPage.clickSortButton();
  await journalPage.clickSortOption('Z-A');

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');
});

test('entry add', async ({ journalPage, journalEntryDetailPage }) => {
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
  await journalEntryDetailPage.clickBackButton();

  const entry = journalPage.getJournalEntry(0);
  await expect(journalPage.getJournalEntryTitle(entry)).toHaveText('Chemex - Tovolea Classic');
  await expect(journalPage.getJournalEntryDetail(entry)).toHaveText(
    '1:17 - 510g/30g | 98 °C | 24 clicks | Nutty and smoky',
  );
});

test('entry edit', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.methodInput.fill('Aeropress Clear');
  await journalEntryDetailPage.clickSaveButton();
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress Clear - Terroir PAN (Rösterei)',
  );
});

test('entry edit cancel', async ({ appPage, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryShowButton(1);
  await journalEntryDetailPage.methodInput.fill('');
  await journalEntryDetailPage.clickBackButton();
  await appPage.clickWarningConfirmButton();

  await expect(journalPage.getJournalEntryTitle(1)).toHaveText('PuckPuck - Äthiopien Chelbesa');
});

test('entry edit without changes', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryShowButton(2);
  await journalEntryDetailPage.descriptionInput.fill('2m30s brew time');
  await journalEntryDetailPage.descriptionInput.fill('');
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.getJournalEntryTitle(2)).toHaveText('V60 Switch - Honeymoon');
});

test('entry delete', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.clickDeleteButton();

  await expect(journalPage.journalList).toHaveCount(2);
});

test('entry delete undo', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.clickDeleteButton();
  await journalPage.clickUndoButton();

  await expect(journalPage.journalList).toHaveCount(3);
});

test('entry copy', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.methodInput.fill('Aeropress Clear');
  await journalEntryDetailPage.clickCopyButton();
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.journalList).toHaveCount(4);
});

test('entry navigate to coffee entry and back to overview', async ({
  journalPage,
  journalEntryDetailPage,
  myCoffeesEntryDetailPage,
}) => {
  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.clickOpenCoffeeEntry();

  await expect(myCoffeesEntryDetailPage.header).toHaveText('Terroir PAN (Rösterei)');

  await myCoffeesEntryDetailPage.clickBackButton();
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );
});

test('entry change detail without save, navigate to coffee entry and back to overview', async ({
  appPage,
  journalPage,
  journalEntryDetailPage,
  myCoffeesEntryDetailPage,
}) => {
  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.waterInput.fill('2000');
  await journalEntryDetailPage.clickOpenCoffeeEntry();
  await appPage.clickWarningConfirmButton();

  await expect(myCoffeesEntryDetailPage.header).toHaveText('Terroir PAN (Rösterei)');

  await myCoffeesEntryDetailPage.clickBackButton();
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );
});

test('entry navigate to calculator', async ({
  journalPage,
  journalEntryDetailPage,
  calculatorPage,
}) => {
  await journalPage.goto();

  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.clickOpenInCalculatorButton();

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('15.38');
  await expect(calculatorPage.waterAmountInput).toHaveValue('200');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('13');
});

test('entry change detail without save, navigate to calculator', async ({
  appPage,
  journalPage,
  journalEntryDetailPage,
  calculatorPage,
}) => {
  await journalPage.goto();

  await journalPage.clickJournalEntryShowButton(0);
  await journalEntryDetailPage.coffeeInput.fill('14');
  await journalEntryDetailPage.clickOpenInCalculatorButton();
  await appPage.clickWarningConfirmButton();

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('14.29');
  await expect(calculatorPage.waterAmountInput).toHaveValue('200');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('14');
});
