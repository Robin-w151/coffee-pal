import type { Locator, Page } from '@playwright/test';

export class CalculatorPage {
  constructor(private readonly page: Page) {}

  get coffeeRatioInput(): Locator {
    return this.page.getByLabel('Coffee', { exact: true });
  }

  get waterRatioInput(): Locator {
    return this.page.getByLabel('Water', { exact: true });
  }

  get fixedRatioToggle(): Locator {
    return this.page.getByLabel('Fixed Ratio').locator('label');
  }

  get waterAmountInput(): Locator {
    return this.page.getByLabel('Amount of water');
  }

  get coffeeAmountInput(): Locator {
    return this.page.getByLabel('Amount of coffee');
  }

  get outputAmountInput(): Locator {
    return this.page.getByLabel('Amount of brewed coffee');
  }

  get icedCoffeeToggle(): Locator {
    return this.page.getByLabel('Iced Coffee').locator('label');
  }

  get iceRatioRange(): Locator {
    return this.page.getByLabel('Ice Ratio');
  }

  get brewWaterAmountInput(): Locator {
    return this.page.getByLabel('Amount of brewing water');
  }

  get iceAmountInput(): Locator {
    return this.page.getByLabel('Amount of ice');
  }

  getPreset(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  async goto(): Promise<void> {
    await this.page.goto('/calculator');
  }
}
