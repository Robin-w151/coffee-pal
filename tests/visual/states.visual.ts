import {
  clearAllEntries,
  colorSchemes,
  expect,
  expectScreenshot,
  gotoReady,
  skipUnlessPhone,
  test,
  waitForScrollToSettle,
} from './visual.fixtures';

for (const colorScheme of colorSchemes) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme });
    skipUnlessPhone();

    test('journal list empty', async ({ page }) => {
      await clearAllEntries(page);
      await gotoReady(page, '/');
      await expect(page.getByText('could not find any entries').first()).toBeVisible();

      await expectScreenshot(page, 'journal-list-empty', colorScheme);
    });

    test('app menu open', async ({ page, appPage }) => {
      await gotoReady(page, '/');
      await appPage.menuButton.click();
      await expect(appPage.menu.getByRole('link', { name: 'Settings' })).toBeVisible();

      await expectScreenshot(page, 'journal-list-menu', colorScheme);
    });

    test('sort popup open', async ({ page }) => {
      await gotoReady(page, '/');
      await page.getByRole('button', { name: 'Change sort order' }).click();
      await expect(page.getByRole('option', { name: 'Recently Added' })).toBeVisible();

      await expectScreenshot(page, 'journal-list-sort-popup', colorScheme);
    });

    test('toast visible', async ({ page, journalPage, journalEntryDetailPage }) => {
      await journalPage.clickJournalEntry(0);
      await expect(journalEntryDetailPage.methodInput).toHaveValue('Aeropress');
      await journalEntryDetailPage.clickDeleteButton();
      await expect(page.getByText('Did you click to fast?')).toBeVisible();

      await expectScreenshot(page, 'journal-list-toast', colorScheme);
    });

    test('brew method suggestions open', async ({ page, journalEntryDetailPage }) => {
      await gotoReady(page, '/journal/new');
      await journalEntryDetailPage.methodInput.click();
      await expect(journalEntryDetailPage.getAutocompleteOption('Aeropress')).toBeVisible();

      await expectScreenshot(page, 'journal-new-method-popup', colorScheme);
    });

    test('brew method suggestions filtered', async ({ page, journalEntryDetailPage }) => {
      await gotoReady(page, '/journal/new');
      await journalEntryDetailPage.methodInput.fill('Ch');
      await expect(journalEntryDetailPage.getAutocompleteOption('Chemex')).toBeVisible();

      await expectScreenshot(page, 'journal-new-method-filtered', colorScheme);
    });

    test('coffee type suggestions open', async ({ page, journalEntryDetailPage }) => {
      await gotoReady(page, '/journal/new');
      await journalEntryDetailPage.coffeeTypeInput.click();
      await expect(
        journalEntryDetailPage.getAutocompleteOption(/Rwanda Kamajumba/).first(),
      ).toBeVisible();

      await expectScreenshot(page, 'journal-new-coffee-type-popup', colorScheme);
    });

    test('journal entry validation errors', async ({ page, journalEntryDetailPage }) => {
      await gotoReady(page, '/journal/new');
      await journalEntryDetailPage.waterInput.focus();
      await journalEntryDetailPage.waterInput.blur();
      await expect(page.getByText('amount of water is required')).toBeVisible();

      await expectScreenshot(page, 'journal-new-validation', colorScheme);
    });

    test('coffee validation errors', async ({ page, myCoffeesEntryDetailPage }) => {
      await gotoReady(page, '/my-coffees/new');
      await myCoffeesEntryDetailPage.nameInput.focus();
      await myCoffeesEntryDetailPage.nameInput.blur();
      await expect(page.getByText(/name is required/i)).toBeVisible();

      await expectScreenshot(page, 'my-coffees-new-validation', colorScheme);
    });

    test('dangerous confirm modal open', async ({ page, appPage }) => {
      await gotoReady(page, '/settings');
      await expect(page.getByRole('button', { name: 'Check for Updates' })).toBeVisible();
      await page.getByRole('switch', { name: 'Toggle Developer Settings' }).click();
      await waitForScrollToSettle(page);
      await page
        .locator('#page')
        .evaluate((element) => element.scrollTo({ top: element.scrollHeight }));
      await waitForScrollToSettle(page);
      await page.getByRole('button', { name: 'Clear IndexedDB' }).click();
      await expect(appPage.warningDialog).toBeVisible();

      await expectScreenshot(page, 'settings-modal-dangerous', colorScheme);
    });
  });
}
