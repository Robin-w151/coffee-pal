import type { Locator, Page } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  get activeAppearenceOption(): Locator {
    return this.page
      .getByText('System Light Dark')
      .locator('div[data-testid="radio-item"][aria-checked="true"]');
  }

  get activeUnitsOption(): Locator {
    return this.page
      .getByText('Metric Imperial')
      .locator('div[data-testid="radio-item"][aria-checked="true"]');
  }

  getAppearenceOption(option: 'System' | 'Light' | 'Dark'): Locator {
    return this.page.getByText(option, { exact: true });
  }

  getUnitsOptions(option: 'Metric' | 'Imperial'): Locator {
    return this.page.getByText(option, { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
  }
}
