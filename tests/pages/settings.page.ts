import type { Locator, Page } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  get activeAppearenceOption(): Locator {
    return this.page
      .getByText('System Light Dark')
      .locator('[data-testid="radio-item"][data-state="checked"]');
  }

  get activeUnitsOption(): Locator {
    return this.page
      .getByText('Metric Imperial')
      .locator('[data-testid="radio-item"][data-state="checked"]');
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
