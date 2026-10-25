import type { Locator, Page } from '@playwright/test';

export class JournalEntryDetailPage {
  constructor(private readonly page: Page) {}

  get header(): Locator {
    return this.page.getByRole('heading', { name: 'New Entry' });
  }

  get methodInput(): Locator {
    return this.page.getByPlaceholder('Brew method');
  }

  get coffeeTypeInput(): Locator {
    return this.page.getByLabel('Type of coffee');
  }

  get waterInput(): Locator {
    return this.page.getByLabel('Amount of water');
  }

  get coffeeInput(): Locator {
    return this.page.getByLabel('Amount of coffee');
  }

  get waterTemperatureInput(): Locator {
    return this.page.getByLabel('Water temperature');
  }

  get grindSettingsInput(): Locator {
    return this.page.getByLabel('Grind settings');
  }

  get descriptionInput(): Locator {
    return this.page.getByLabel('Description');
  }

  get rating(): Locator {
    return this.page.getByTestId('rating');
  }

  get waterUnitSelect(): Locator {
    return this.getUnitSelect('Amount of water');
  }

  getRatingStar(star: number): Locator {
    return this.rating.getByRole('button').nth(star - 1);
  }

  getAutocompleteOption(name: string | RegExp): Locator {
    // Skeleton v2 renders autocomplete options as buttons; later versions use the option role.
    return this.page
      .getByRole('button', { name, exact: true })
      .or(this.page.getByRole('option', { name, exact: true }));
  }

  private getUnitSelect(label: string): Locator {
    return this.page.locator('label', { hasText: label }).getByRole('combobox');
  }

  async clickSaveButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async clickCopyButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Copy' }).click();
  }

  async clickDeleteButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async clickBackButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Go back' }).click();
  }

  async clickOpenCoffeeEntry(): Promise<void> {
    await this.page.getByRole('link', { name: 'Open coffee entry' }).click();
  }

  async clickOpenInCalculatorButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Calculator' }).click();
  }
}
