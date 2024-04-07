import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('ratio coffee', async ({ calculatorPage }) => {
  await calculatorPage.coffeeRatioInput.fill('5');
  await calculatorPage.coffeeRatioInput.press('Enter');

  await expect(calculatorPage.coffeeAmountInput).toHaveValue('85');
});

test('ratio water', async ({ calculatorPage }) => {
  await calculatorPage.waterRatioInput.fill('500');
  await calculatorPage.waterRatioInput.press('Enter');

  await expect(calculatorPage.waterAmountInput).toHaveValue('500');
});

test('recipe water amount', async ({ calculatorPage }) => {
  await calculatorPage.waterAmountInput.fill('480');
  await calculatorPage.waterAmountInput.press('Enter');

  await expect(calculatorPage.coffeeAmountInput).toHaveValue('32');
  await expect(calculatorPage.outputAmountInput).toHaveValue('416');
});

test('recipe coffee amount', async ({ calculatorPage }) => {
  await calculatorPage.coffeeAmountInput.fill('20');
  await calculatorPage.coffeeAmountInput.press('Enter');

  await expect(calculatorPage.waterAmountInput).toHaveValue('300');
  await expect(calculatorPage.outputAmountInput).toHaveValue('260');
});

test('recipe output amount', async ({ calculatorPage }) => {
  await calculatorPage.outputAmountInput.fill('312');
  await calculatorPage.outputAmountInput.press('Enter');

  await expect(calculatorPage.waterAmountInput).toHaveValue('360');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('24');
});

test('iced toggle', async ({ calculatorPage }) => {
  await calculatorPage.icedCoffeeToggle.check();

  await expect(calculatorPage.brewWaterAmountInput).toHaveValue('168');
  await expect(calculatorPage.iceAmountInput).toHaveValue('72');
});

test('iced ratio 25%', async ({ calculatorPage }) => {
  await calculatorPage.icedCoffeeToggle.check();
  await calculatorPage.iceRatioRange.fill('25');

  await expect(calculatorPage.brewWaterAmountInput).toHaveValue('180');
  await expect(calculatorPage.iceAmountInput).toHaveValue('60');
});

test('iced ratio 50%', async ({ calculatorPage }) => {
  await calculatorPage.icedCoffeeToggle.check();
  await calculatorPage.iceRatioRange.fill('50');

  await expect(calculatorPage.brewWaterAmountInput).toHaveValue('120');
  await expect(calculatorPage.iceAmountInput).toHaveValue('120');
});

test('variable ratio change water', async ({ calculatorPage }) => {
  await calculatorPage.fixedRatioToggle.uncheck();
  await calculatorPage.waterAmountInput.fill('272');
  await calculatorPage.waterAmountInput.press('Enter');

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('17');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('16');
  await expect(calculatorPage.outputAmountInput).toHaveValue('240');
});

test('variable ratio change coffee', async ({ calculatorPage }) => {
  await calculatorPage.fixedRatioToggle.uncheck();
  await calculatorPage.coffeeAmountInput.fill('20');
  await calculatorPage.coffeeAmountInput.press('Enter');

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('12');
  await expect(calculatorPage.waterAmountInput).toHaveValue('240');
  await expect(calculatorPage.outputAmountInput).toHaveValue('200');
});

test('variable ratio change output', async ({ calculatorPage }) => {
  await calculatorPage.fixedRatioToggle.uncheck();
  await calculatorPage.outputAmountInput.fill('300');
  await calculatorPage.outputAmountInput.press('Enter');

  await expect(calculatorPage.coffeeRatioInput).toHaveValue('1');
  await expect(calculatorPage.waterRatioInput).toHaveValue('20.75');
  await expect(calculatorPage.waterAmountInput).toHaveValue('332');
  await expect(calculatorPage.coffeeAmountInput).toHaveValue('16');
});

test('select preset', async ({ calculatorPage }) => {
  await calculatorPage.fixedRatioToggle.uncheck();
  await calculatorPage.getPreset('Aeropress 7:100').click();

  await expect(calculatorPage.fixedRatioToggle).toBeChecked();
});

test('select preset with ice ratio', async ({ calculatorPage }) => {
  await calculatorPage.getPreset('Iced Aeropress 7:100').click();

  await expect(calculatorPage.icedCoffeeToggle).toBeChecked();

  await expect(calculatorPage.iceRatioRange).toHaveValue('30');
  await expect(calculatorPage.brewWaterAmountInput).toHaveValue('140');
  await expect(calculatorPage.iceAmountInput).toHaveValue('60');
});
