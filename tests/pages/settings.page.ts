import { expect, type Locator, type Page } from '@playwright/test';

export class SettingsPage {
  constructor(private readonly page: Page) {}

  get activeAppearenceOption(): Locator {
    return this.getCheckedRadio(['System', 'Light', 'Dark']);
  }

  get activeUnitsOption(): Locator {
    return this.getCheckedRadio(['Metric', 'Imperial']);
  }

  get backupFileInput(): Locator {
    return this.page.locator('input[type="file"][name="import-file-input"]');
  }

  get serverUrlInput(): Locator {
    return this.page.getByPlaceholder('Nextcloud Server URL');
  }

  get serverSchemeSelect(): Locator {
    return this.page.locator('label', { hasText: 'Nextcloud Server URL' }).getByRole('combobox');
  }

  get openServerUrlLink(): Locator {
    return this.page.getByRole('link', { name: 'Open URL' });
  }

  getAppearenceOption(option: 'System' | 'Light' | 'Dark'): Locator {
    return this.page.getByText(option, { exact: true });
  }

  getUnitsOptions(option: 'Metric' | 'Imperial'): Locator {
    return this.page.getByText(option, { exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/settings');
    await expect(this.page.locator('html')).toHaveAttribute('data-test', 'ready');
  }

  async clickImportButton(): Promise<void> {
    await this.page.getByRole('button', { name: 'Import' }).click();
  }

  // The label around the checked radio, whose text is the option: the radio itself may be an input
  // without text content.
  private getCheckedRadio(options: Array<string>): Locator {
    return this.page
      .locator('label')
      .filter({ has: this.page.getByRole('radio', { checked: true }) })
      .filter({ hasText: new RegExp(String.raw`^\s*(${options.join('|')})\s*$`) });
  }
}
