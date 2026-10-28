import { expect, type Locator, type Page } from '@playwright/test';

export class JournalPage {
  constructor(private readonly page: Page) {}

  get journalList(): Locator {
    return this.page.locator('main dl > a');
  }

  get emptyMessage(): Locator {
    return this.page.getByText('could not find any entries').first();
  }

  getPaginatorButton(button: 'First' | 'Previous' | 'Next' | 'Last'): Locator {
    return this.page.getByRole('button', { name: `${button} page`, exact: true });
  }

  getSortOption(option: 'A-Z' | 'Z-A' | 'Best' | 'Recently Added' | 'Recently Updated'): Locator {
    return this.page.getByRole('option', { name: option });
  }

  getJournalEntry(entry: number): Locator {
    return this.journalList.nth(entry);
  }

  getJournalEntryTitle(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).locator('dt');
  }

  getJournalEntryDetail(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).locator('dd');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await expect(this.page.locator('html')).toHaveAttribute('data-test', 'ready');
    await this.clickSortButton();
    await this.clickSortOption('Recently Updated');
  }

  async clickAddButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Add new entry' }).click();
  }

  async enterSearch(search: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.getByPlaceholder('Search...').fill(search);
  }

  async clearSearch(): Promise<void> {
    await this.page.getByRole('button', { name: 'Clear' }).click();
  }

  async clickSortButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Change sort order' }).click();
    await expect(this.page.getByRole('option', { name: 'Recently Added' })).toBeVisible();
  }

  // The listbox keeps focus itself and highlights options (type-ahead); Enter selects.
  async selectSortOptionWithKeyboard(
    option: 'A-Z' | 'Z-A' | 'Best' | 'Recently Added' | 'Recently Updated',
  ): Promise<void> {
    const listbox = this.page.getByRole('listbox');
    await listbox.focus();
    await listbox.pressSequentially(option);
    await expect(this.getSortOption(option)).toHaveAttribute('data-highlighted');
    await listbox.press('Enter');
  }

  async clickSortOption(
    option: 'A-Z' | 'Z-A' | 'Best' | 'Recently Added' | 'Recently Updated',
  ): Promise<void> {
    await this.page.getByRole('option', { name: option }).click();
  }

  async clickUndoButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Undo' }).click();
  }

  async clickJournalEntry(entry: Locator | number): Promise<void> {
    await (typeof entry === 'number' ? this.getJournalEntry(entry) : entry).click();
  }
}
