import type { Locator, Page } from '@playwright/test';

export class DripCounterPage {
  constructor(private readonly page: Page) {}

  get dropsPerMinute(): Locator {
    return this.page.getByText('drops/min');
  }

  get startMessage(): Locator {
    return this.page.getByText('Tap to start counting');
  }

  get estimatedTime(): Locator {
    return this.page.getByText('Estimated time:');
  }

  async goto(): Promise<void> {
    await this.page.goto('/drip-counter');
  }

  async clickTapButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Tap' }).click();
  }

  async clickResetButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reset' }).click();
  }
}
