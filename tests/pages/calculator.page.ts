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

  get temperatureConverterToggle(): Locator {
    return this.page.getByLabel('Temperature Converter').locator('label');
  }

  get temperatureCelsiusInput(): Locator {
    return this.page.getByLabel('Celsius');
  }

  get temperatureFahrenheitInput(): Locator {
    return this.page.getByLabel('Fahrenheit');
  }

  getPreset(name: string): Locator {
    return this.page.getByRole('button', { name, exact: true });
  }

  async goto(): Promise<void> {
    await this.page.goto('/calculator');
  }
}
