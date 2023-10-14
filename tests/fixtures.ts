import { JournalPage, testJournalEntries } from './pages/journal.page';
import { test as base, expect, type Page } from '@playwright/test';
import { MyCoffeesPage, testCoffeeEntries } from './pages/myCoffees.page';
import { CalculatorPage } from './pages/calculator.page';
import { JournalEntryDetailPage } from './pages/journalEntryDetail.page';
import { MyCoffeesEntryDetailPage } from './pages/myCoffeesEntryDetail.page';

interface TestFixtures {
  journalPage: JournalPage;
  journalEntryDetailPage: JournalEntryDetailPage;
  myCoffeesPage: MyCoffeesPage;
  myCoffeesEntryDetailPage: MyCoffeesEntryDetailPage;
  calculatorPage: CalculatorPage;
}

export const test = base.extend<TestFixtures>({
  journalPage: async ({ page }, use) => {
    const journalPage = new JournalPage(page);
    await journalPage.goto();
    await expect(journalPage.emptyMessage).toBeVisible();

    for (const entry of testJournalEntries) {
      await journalPage.addJournalEntry(entry);
    }

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

    for (const entry of testCoffeeEntries) {
      await myCoffeesPage.addCoffeeEntry(entry);
    }

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

    await use(calculatorPage);
  },
});

async function waitForTestReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}
