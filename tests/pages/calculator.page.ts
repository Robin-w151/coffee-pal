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
    return this.page.getByRole('switch', { name: 'Fixed Ratio' });
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
    return this.page.getByRole('switch', { name: 'Toggle Iced Coffee' });
  }

  /** The slider's form value (a hidden input). Use `iceRatioThumb` to interact with it. */
  get iceRatioRange(): Locator {
    return this.page.locator('input[name="ice-ratio"]');
  }

  get iceRatioThumb(): Locator {
    return this.page.getByRole('slider', { name: /^Ice Ratio/ });
  }

  get iceRatioValue(): Locator {
    return this.page.getByText(/^\d+ %$/);
  }

  // The thumb is a div[role=slider], which `fill` can't set, so the value is set by keyboard.
  async setIceRatio(percent: number): Promise<void> {
    await this.iceRatioThumb.press('Home');
    for (let i = 0; i < percent; i++) {
      await this.iceRatioThumb.press('ArrowRight');
    }
  }

  get brewWaterAmountInput(): Locator {
    return this.page.getByLabel('Amount of brewing water');
  }

  get iceAmountInput(): Locator {
    return this.page.getByLabel('Amount of ice');
  }

  get temperatureConverterToggle(): Locator {
    return this.page.getByRole('switch', { name: 'Toggle Temperature Converter' });
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
