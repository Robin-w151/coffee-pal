import { JournalPage, testJournalEntries } from './pages/journal.page';
import { test as base, expect, type Page } from '@playwright/test';
import { MyCoffeesPage, testCoffeeEntries } from './pages/myCoffees.page';
import { CalculatorPage } from './pages/calculator.page';
import { JournalEntryDetailPage } from './pages/journalEntryDetail.page';
import { MyCoffeesEntryDetailPage } from './pages/myCoffeesEntryDetail.page';
import { DripCounterPage } from './pages/dripCounter.page';

interface TestFixtures {
  journalPage: JournalPage;
  journalEntryDetailPage: JournalEntryDetailPage;
  myCoffeesPage: MyCoffeesPage;
  myCoffeesEntryDetailPage: MyCoffeesEntryDetailPage;
  calculatorPage: CalculatorPage;
  dripCounterPage: DripCounterPage;
}

export const test = base.extend<TestFixtures>({
  journalPage: async ({ page }, use) => {
    const journalPage = new JournalPage(page);
    await journalPage.goto();
    await expect(journalPage.emptyMessage).toBeVisible();

    await journalPage.addJournalEntries(testJournalEntries);
    await journalPage.goto();
    await expect(journalPage.getJournalEntryTitle(0)).toHaveText('Aeropress - Terroir PAN');

    await use(journalPage);
  },
  journalEntryDetailPage: async ({ page }, use) => {
    const journalEntryDetailPage = new JournalEntryDetailPage(page);
    await use(journalEntryDetailPage);
  },
  myCoffeesPage: async ({ page }, use) => {
    const myCoffeesPage = new MyCoffeesPage(page);
    await myCoffeesPage.goto();
    await expect(myCoffeesPage.emptyMessage).toBeVisible();

    await myCoffeesPage.addCoffeeEntry(testCoffeeEntries);
    await myCoffeesPage.goto();
    await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText(
      'Rwanda Kamajumba - Kamajumba Estate',
    );

    await use(myCoffeesPage);
  },
  myCoffeesEntryDetailPage: async ({ page }, use) => {
    const myCoffeesEntryDetailPage = new MyCoffeesEntryDetailPage(page);
    await use(myCoffeesEntryDetailPage);
  },
  calculatorPage: async ({ page }, use) => {
    const calculatorPage = new CalculatorPage(page);
    await calculatorPage.goto();
    await waitForTestReady(page);
    await calculatorPage.getPreset('V60 1:15').click();

    await use(calculatorPage);
  },
  dripCounterPage: async ({ page }, use) => {
    const dripCounterPage = new DripCounterPage(page);
    await dripCounterPage.goto();
    await waitForTestReady(page);

    await use(dripCounterPage);
  },
});

async function waitForTestReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}
