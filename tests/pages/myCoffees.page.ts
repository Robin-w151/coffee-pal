import type { Locator, Page } from '@playwright/test';

export class MyCoffeesPage {
  constructor(private readonly page: Page) {}

  get coffeeList(): Locator {
    return this.page.locator('main dl > a');
  }

  get emptyMessage(): Locator {
    return this.page.getByText('could not find any coffees').first();
  }

  getCoffeeEntry(entry: number): Locator {
    return this.coffeeList.nth(entry);
  }

  getCoffeeEntryTitle(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getCoffeeEntry(entry) : entry).locator('dt');
  }

  getCoffeeEntryDetail(entry: Locator | number): Locator {
    return (typeof entry === 'number' ? this.getCoffeeEntry(entry) : entry).locator('dd');
  }

  async goto(): Promise<void> {
    await this.page.goto('/my-coffees');
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
  }

  async clickSortOption(option: 'A-Z' | 'Z-A' | 'Latest' | 'Best'): Promise<void> {
    await this.page.getByRole('option', { name: option }).click();
  }

  async clickUndoButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Undo' }).click();
  }

  async clickCoffeeEntry(entry: Locator | number): Promise<void> {
    return (typeof entry === 'number' ? this.getCoffeeEntry(entry) : entry).click();
  }
}
