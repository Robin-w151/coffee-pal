import type { Locator, Page } from 'playwright/test';

export class AppPage {
  constructor(private readonly page: Page) {}

  get warningDialog(): Locator {
    return this.page.locator('.modal');
  }

  async clickWarningCancelButton(): Promise<void> {
    await this.warningDialog.getByRole('button', { name: 'Cancel' }).click();
  }

  async clickWarningConfirmButton(): Promise<void> {
    await this.warningDialog.getByRole('button', { name: 'Confirm' }).click();
  }
}
