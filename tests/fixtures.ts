import { test as base, expect, type Page } from '@playwright/test';
import { AppPage, testCoffeeEntries, testJournalEntries } from './features/app.feature';
import { CalculatorPage } from './pages/calculator.page';
import { DripCounterPage } from './pages/dripCounter.page';
import { JournalPage } from './pages/journal.page';
import { JournalEntryDetailPage } from './pages/journalEntryDetail.page';
import { MyCoffeesPage } from './pages/myCoffees.page';
import { MyCoffeesEntryDetailPage } from './pages/myCoffeesEntryDetail.page';
import { SettingsPage } from './pages/settings.page';

interface TestFixtures {
  appPage: AppPage;
  journalPage: JournalPage;
  journalEntryDetailPage: JournalEntryDetailPage;
  myCoffeesPage: MyCoffeesPage;
  myCoffeesEntryDetailPage: MyCoffeesEntryDetailPage;
  calculatorPage: CalculatorPage;
  dripCounterPage: DripCounterPage;
  settingsPage: SettingsPage;
}

export const test = base.extend<TestFixtures>({
  appPage: [
    async ({ page }, use) => {
      const appPage = new AppPage(page);
      await appPage.goto();
      await expect(page.getByText('could not find any entries').first()).toBeVisible();

      await appPage.addJournalEntries(testJournalEntries);
      await appPage.addCoffeeEntries(testCoffeeEntries);

      await use(appPage);
    },
    { auto: true },
  ],
  journalPage: async ({ page }, use) => {
    const journalPage = new JournalPage(page);
    await journalPage.goto();
    await expect(journalPage.getJournalEntryTitle(0)).toHaveText(
      'Aeropress - Terroir PAN (Rösterei)',
    );

    await use(journalPage);
  },
  journalEntryDetailPage: async ({ page }, use) => {
    const journalEntryDetailPage = new JournalEntryDetailPage(page);
    await use(journalEntryDetailPage);
  },
  myCoffeesPage: async ({ page }, use) => {
    const myCoffeesPage = new MyCoffeesPage(page);
    await myCoffeesPage.goto();
    await expect(myCoffeesPage.getCoffeeEntryTitle(0)).toHaveText(
      'Rwanda Kamajumba (Drip Roasters)',
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
  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await settingsPage.goto();
    await waitForTestReady(page);

    await use(settingsPage);
  },
});

async function waitForTestReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}
