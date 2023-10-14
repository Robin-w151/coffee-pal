import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('calculator ratio coffee', async ({ calculatorPage }) => {
  await calculatorPage.coffeeRatioInput.fill('5');
  await calculatorPage.coffeeRatioInput.press('Enter');

  await expect(calculatorPage.coffeeAmountInput).toHaveValue('5');
});

test('calculator ratio water', async ({ calculatorPage }) => {
  await calculatorPage.waterRatioInput.fill('500');
  await calculatorPage.waterRatioInput.press('Enter');

  await expect(calculatorPage.waterAmountInput).toHaveValue('500');
});

test('calculator recipe water amount', async ({ calculatorPage }) => {
  await calculatorPage.waterAmountInput.fill('480');
  await calculatorPage.waterAmountInput.press('Enter');

  await expect(calculatorPage.coffeeAmountInput).toHaveValue('32');
  await expect(calculatorPage.outputAmountInput).toHaveValue('416');
});

test('calculator recipe coffee amount', async ({ calculatorPage }) => {
  await calculatorPage.coffeeAmountInput.fill('20');
  await calculatorPage.coffeeAmountInput.press('Enter');

  await expect(calculatorPage.waterAmountInput).toHaveValue('300');
  await expect(calculatorPage.outputAmountInput).toHaveValue('260');
});

test('calculator recipe output amount', async ({ calculatorPage }) => {
  await calculatorPage.outputAmountInput.fill('312');
  await calculatorPage.outputAmountInput.press('Enter');

  await expect(calculatorPage.waterAmountInput).toHaveValue('360');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('24');
});

test('calculator iced', async ({ calculatorPage }) => {
  await calculatorPage.icedCoffeeToggle.check();

  await expect(calculatorPage.brewWaterAmountInput).toHaveValue('144');
  await expect(calculatorPage.iceAmountInput).toHaveValue('96');
});

test('calculator iced ratio', async ({ calculatorPage }) => {
  await calculatorPage.icedCoffeeToggle.check();
  await calculatorPage.iceRatioRange.fill('50');

  await expect(calculatorPage.brewWaterAmountInput).toHaveValue('120');
  await expect(calculatorPage.iceAmountInput).toHaveValue('120');
});
