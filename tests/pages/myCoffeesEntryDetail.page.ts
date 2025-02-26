import type { Locator, Page } from '@playwright/test';

export class MyCoffeesEntryDetailPage {
  constructor(private readonly page: Page) {}

  get header(): Locator {
    return this.page.getByRole('heading');
  }

  get nameInput(): Locator {
    return this.page.getByPlaceholder('Name');
  }

  get originInput(): Locator {
    return this.page.getByPlaceholder('Origin');
  }

  get processInput(): Locator {
    return this.page.getByPlaceholder('Process');
  }

  get varietyInput(): Locator {
    return this.page.getByPlaceholder('Variety');
  }

  get altitudeInput(): Locator {
    return this.page.getByPlaceholder('Altitude');
  }

  get roasterInput(): Locator {
    return this.page.getByPlaceholder('Roaster');
  }

  get traderInput(): Locator {
    return this.page.getByPlaceholder('Trader');
  }

  get aromasInput(): Locator {
    return this.page.getByPlaceholder('Aromas');
  }

  get descriptionInput(): Locator {
    return this.page.getByLabel('Description');
  }

  async clickSaveButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async clickDeleteButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Delete' }).click();
  }

  async clickBackButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Go back' }).click();
  }
}
