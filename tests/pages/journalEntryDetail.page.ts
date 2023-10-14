import type { Locator, Page } from '@playwright/test';

export class JournalEntryDetailPage {
  constructor(private readonly page: Page) {}

  get header(): Locator {
    return this.page.getByRole('heading', { name: 'Entry' });
  }

  get methodInput(): Locator {
    return this.page.getByPlaceholder('brew method');
  }

  get coffeeTypeInput(): Locator {
    return this.page.getByLabel('type of coffee');
  }

  get waterInput(): Locator {
    return this.page.getByLabel('amount of water');
  }

  get coffeeInput(): Locator {
    return this.page.getByLabel('amount of coffee');
  }

  get waterTemperatureInput(): Locator {
    return this.page.getByLabel('water temperature');
  }

  get grindSettingsInput(): Locator {
    return this.page.getByLabel('grind settings');
  }

  get descriptionInput(): Locator {
    return this.page.getByLabel('description');
  }

  async clickSaveButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async clickDeleteButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }
}
