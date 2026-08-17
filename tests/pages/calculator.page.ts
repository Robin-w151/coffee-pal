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
    return this.page.getByLabel('Fixed Ratio');
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
    return this.page.getByLabel('Iced Coffee');
  }

  get iceRatioSlider(): Locator {
    return this.page.getByRole('slider');
  }

  get brewWaterAmountInput(): Locator {
    return this.page.getByLabel('Amount of brewing water');
  }

  get iceAmountInput(): Locator {
    return this.page.getByLabel('Amount of ice');
  }

  get temperatureConverterToggle(): Locator {
    return this.page.getByLabel('Temperature Converter');
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

  async setFixedRatio(checked: boolean): Promise<void> {
    await this.setSwitch('Fixed Ratio', this.fixedRatioToggle, checked);
  }

  async setIcedCoffee(checked: boolean): Promise<void> {
    await this.setSwitch('Iced Coffee', this.icedCoffeeToggle, checked);
  }

  async setTemperatureConverter(checked: boolean): Promise<void> {
    await this.setSwitch('Temperature Converter', this.temperatureConverterToggle, checked);
  }

  /**
   * Drives the slider with the keyboard. Its underlying input is visually
   * hidden, so it cannot be filled directly.
   */
  async setIceRatio(value: number): Promise<void> {
    const slider = this.iceRatioSlider;
    await slider.focus();

    for (let i = 0; i < 200; i++) {
      const current = Number(await slider.getAttribute('aria-valuenow'));
      if (current === value) {
        return;
      }
      await slider.press(current < value ? 'ArrowRight' : 'ArrowLeft');
    }

    throw new Error(`Could not set ice ratio to ${value}`);
  }

  async goto(): Promise<void> {
    await this.page.goto('/calculator');
  }

  /**
   * Skeleton v5 switches render a visually hidden checkbox inside a label, so
   * the label is the click target while the checkbox carries the state.
   */
  private async setSwitch(name: string, checkbox: Locator, checked: boolean): Promise<void> {
    if ((await checkbox.isChecked()) === checked) {
      return;
    }

    await this.page.locator('label[data-scope="switch"]').filter({ hasText: name }).click();
  }
}
