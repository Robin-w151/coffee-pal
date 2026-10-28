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
    return this.rating.getByRole('radio').nth(star - 1);
  }

  // Typing opens the suggestions, and the combobox focuses its input a frame later; moving on to
  // another field before that would send its text to this input.
  async fillCombobox(input: Locator, text: string): Promise<void> {
    await input.fill(text);
    await this.page.evaluate(() => new Promise(requestAnimationFrame));
  }

  // Escape closes the suggestions, and the combobox refocuses its input a frame later; moving on
  // to another field before that would send its text to this input.
  async closeSuggestions(input: Locator): Promise<void> {
    await input.press('Escape');
    await this.page.evaluate(() => new Promise(requestAnimationFrame));
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
