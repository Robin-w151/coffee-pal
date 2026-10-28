import { expect } from '@playwright/test';
import { isShown, testJournalEntries } from '../features/app.feature';
import { test } from '../fixtures';
import type { JournalPage } from '../pages/journal.page';

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

test('sort Recently Added', async ({ journalPage }) => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );

  await journalPage.clickSortButton();
  await journalPage.clickSortOption('Recently Added');

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');
});

test('sort Recently Updated', async ({ journalPage }) => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );

  await journalPage.clickSortButton();
  await journalPage.clickSortOption('Recently Updated');

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );
});

test('sort Best', async ({ journalPage }) => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );

  await journalPage.clickSortButton();
  await journalPage.clickSortOption('Best');

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');
});

test('sort A-Z', async ({ journalPage }) => {
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );

  await journalPage.clickSortButton();
  await journalPage.clickSortOption('A-Z');

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress - Terroir PAN (Rösterei)',
  );
});

test('sort Z-A', async ({ journalPage }) => {
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
  await journalEntryDetailPage.closeSuggestions(journalEntryDetailPage.methodInput);
  await journalEntryDetailPage.coffeeTypeInput.fill('Tovolea Classic');
  await journalEntryDetailPage.closeSuggestions(journalEntryDetailPage.coffeeTypeInput);
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
  await journalPage.clickJournalEntry(0);
  await journalEntryDetailPage.methodInput.fill('Aeropress Clear');
  await journalEntryDetailPage.clickSaveButton();
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
    'Aeropress Clear - Terroir PAN (Rösterei)',
  );
});

test('entry edit cancel', async ({ appPage, journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntry(1);
  await journalEntryDetailPage.methodInput.fill('');
  await journalEntryDetailPage.clickBackButton();
  await appPage.clickWarningConfirmButton();

  await expect(journalPage.getJournalEntryTitle(1)).toHaveText('PuckPuck - Äthiopien Chelbesa');
});

test('entry edit without changes', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntry(2);
  await journalEntryDetailPage.descriptionInput.fill('2m30s brew time');
  await journalEntryDetailPage.descriptionInput.fill('');
  await journalEntryDetailPage.clickBackButton();

  await expect(journalPage.getJournalEntryTitle(2)).toHaveText('V60 Switch - Honeymoon');
});

test('entry delete', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntry(0);
  await journalEntryDetailPage.clickDeleteButton();

  await expect(journalPage.journalList).toHaveCount(2);
});

test('entry delete undo', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntry(0);
  await journalEntryDetailPage.clickDeleteButton();
  await journalPage.clickUndoButton();

  await expect(journalPage.journalList).toHaveCount(3);
});

test('entry copy', async ({ journalPage, journalEntryDetailPage }) => {
  await journalPage.clickJournalEntry(0);
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
  await journalPage.clickJournalEntry(0);
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
  await journalPage.clickJournalEntry(0);
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

  await journalPage.clickJournalEntry(0);
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

  await journalPage.clickJournalEntry(0);
  await journalEntryDetailPage.coffeeInput.fill('14');
  await journalEntryDetailPage.clickOpenInCalculatorButton();
  await appPage.clickWarningConfirmButton();

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('14.29');
  await expect(calculatorPage.waterAmountInput).toHaveValue('200');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('14');
});

test('entry add new entry and navigate to calculator', async ({
  page,
  journalPage,
  journalEntryDetailPage,
  calculatorPage,
}) => {
  await journalPage.goto();
  await page.waitForTimeout(500);

  await journalPage.clickAddButton();
  await journalEntryDetailPage.fillCombobox(journalEntryDetailPage.methodInput, 'V60');
  await journalEntryDetailPage.waterInput.fill('250');
  await journalEntryDetailPage.coffeeInput.fill('16.67');
  await journalEntryDetailPage.clickSaveButton();
  await journalEntryDetailPage.clickOpenInCalculatorButton();

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('15');
  await expect(calculatorPage.waterAmountInput).toHaveValue('250');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('16.67');
});

test.describe('form controls', () => {
  test('brew method autocomplete filters while typing', async ({
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickAddButton();
    await journalEntryDetailPage.methodInput.fill('Chem');

    await expect
      .poll(() => isShown(journalEntryDetailPage.getAutocompleteOption('Chemex')))
      .toBe(true);
    await expect
      .poll(() => isShown(journalEntryDetailPage.getAutocompleteOption('Aeropress')))
      .toBe(false);
  });

  test('brew method autocomplete selects with arrow down and enter', async ({
    page,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickAddButton();
    await journalEntryDetailPage.methodInput.fill('Chem');
    await expect
      .poll(() => isShown(journalEntryDetailPage.getAutocompleteOption('Chemex')))
      .toBe(true);

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(journalEntryDetailPage.methodInput).toHaveValue('Chemex');
  });

  test('coffee type autocomplete selects on click', async ({
    page,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickAddButton();
    await journalEntryDetailPage.coffeeTypeInput.fill('Wied');
    const option = journalEntryDetailPage.getAutocompleteOption(/Wiedner Mischung/);
    await expect.poll(() => isShown(option)).toBe(true);

    await option.click();

    await expect(journalEntryDetailPage.coffeeTypeInput).toHaveValue('Wiedner Mischung (Alt Wien)');
    await expect(page.getByRole('link', { name: 'Open coffee entry' })).toBeVisible();
  });

  test('sort list box marks the selected option', async ({ journalPage }) => {
    await journalPage.clickSortButton();
    await expect(journalPage.getSortOption('Recently Updated')).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await journalPage.clickSortOption('Z-A');
    await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');

    await journalPage.clickSortButton();
    await expect(journalPage.getSortOption('Z-A')).toHaveAttribute('aria-selected', 'true');
    await expect(journalPage.getSortOption('Recently Updated')).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  test('sort list box selects with the keyboard', async ({ journalPage }) => {
    await journalPage.clickSortButton();
    await journalPage.selectSortOptionWithKeyboard('Best');

    await expect(journalPage.getJournalEntryTitle(0)).toHaveText('V60 Switch - Honeymoon');
    await journalPage.clickSortButton();
    await expect(journalPage.getSortOption('Best')).toHaveAttribute('aria-selected', 'true');
  });

  test('paginator', async ({ appPage, journalPage }) => {
    // 42 generated + 3 fixture entries = 45; the generated ones are newer, so they come first.
    const entries = Array.from({ length: 42 }, (_, i) => ({
      ...testJournalEntries[0],
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      coffeeType: `Entry ${String(i + 1).padStart(2, '0')}`,
      updatedAt: new Date(Date.UTC(2024, 0, 1) - i * 60_000).toISOString(),
    }));
    await appPage.addJournalEntries(entries);
    await journalPage.goto();

    await expectPage(journalPage, 20, 'Aeropress - Entry 01', 'Aeropress - Entry 20');
    await expect(journalPage.getPaginatorButton('First')).toBeDisabled();
    await expect(journalPage.getPaginatorButton('Previous')).toBeDisabled();

    await journalPage.getPaginatorButton('Next').click();
    await expectPage(journalPage, 20, 'Aeropress - Entry 21', 'Aeropress - Entry 40');

    await journalPage.getPaginatorButton('Last').click();
    await expectPage(journalPage, 5, 'Aeropress - Entry 41', 'V60 Switch - Honeymoon');
    await expect(journalPage.getPaginatorButton('Next')).toBeDisabled();
    await expect(journalPage.getPaginatorButton('Last')).toBeDisabled();

    await journalPage.getPaginatorButton('First').click();
    await expectPage(journalPage, 20, 'Aeropress - Entry 01', 'Aeropress - Entry 20');
  });

  test('rating is set, saved and cleared', async ({
    page,
    appPage,
    journalPage,
    journalEntryDetailPage,
  }) => {
    const entryId = testJournalEntries[0].id;
    await journalPage.clickJournalEntry(0);
    await expect(journalEntryDetailPage.rating).toHaveAttribute('data-value', '3');

    await journalEntryDetailPage.getRatingStar(4).click();
    await expect(journalEntryDetailPage.rating).toHaveAttribute('data-value', '4');
    await journalEntryDetailPage.clickSaveButton();
    await expect.poll(async () => (await appPage.getJournalEntry(entryId))?.rating ?? 0).toBe(4);
    await page.reload();
    await expect(journalEntryDetailPage.rating).toHaveAttribute('data-value', '4');

    await journalEntryDetailPage.getRatingStar(4).click();
    await expect(journalEntryDetailPage.rating).toHaveAttribute('data-value', '0');
    await journalEntryDetailPage.clickSaveButton();
    await expect.poll(async () => (await appPage.getJournalEntry(entryId))?.rating ?? 0).toBe(0);
    await page.reload();
    await expect(journalEntryDetailPage.rating).toHaveAttribute('data-value', '0');
  });

  test('measurement input converts on unit change and stores the base value', async ({
    appPage,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickJournalEntry(0);
    await expect(journalEntryDetailPage.waterInput).toHaveValue('200');

    await journalEntryDetailPage.waterUnitSelect.selectOption('oz');
    await expect(journalEntryDetailPage.waterInput).toHaveValue('7.05');

    await journalEntryDetailPage.waterInput.fill('10');
    await journalEntryDetailPage.clickSaveButton();
    await expect
      .poll(async () => (await appPage.getJournalEntry(testJournalEntries[0].id))?.water)
      .toBe(283.5);
    await journalEntryDetailPage.clickBackButton();

    await expect(journalPage.getJournalEntryDetail(0)).toContainText('283.5g/13g');
  });
});

async function expectPage(
  journalPage: JournalPage,
  count: number,
  firstTitle: string,
  lastTitle: string,
): Promise<void> {
  await expect(journalPage.journalList).toHaveCount(count);
  await expect(journalPage.getJournalEntryTitle(0)).toHaveText(firstTitle);
  await expect(journalPage.getJournalEntryTitle(count - 1)).toHaveText(lastTitle);
}
