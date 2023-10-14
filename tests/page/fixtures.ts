import { JournalPage, testJournalEntries } from './journal.page';
import { test as base, expect } from '@playwright/test';

interface TestFixtures {
  journalPage: JournalPage;
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
});
