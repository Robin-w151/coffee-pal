import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('multiple taps', async ({ page, dripCounterPage }) => {
  for (const timeout of [0, 1000, 1100, 850, 990, 1010]) {
    await page.waitForTimeout(timeout);
    await dripCounterPage.clickTapButton();
  }

  await expect(dripCounterPage.dropsPerMinute).toHaveText(/^[56]\d drops\/min$/i);
});

test('reset', async ({ dripCounterPage }) => {
  await dripCounterPage.clickTapButton();
  await dripCounterPage.clickResetButton();

  await expect(dripCounterPage.startMessage).toBeVisible();
});

test('estimation', async ({ page, dripCounterPage }) => {
  for (const timeout of [0, 100, 1000]) {
    await page.waitForTimeout(timeout);
    await dripCounterPage.clickTapButton();
  }

  const dropsPerMinute = Number.parseInt(
    /(?<dpm>\d+) drops\/min/.exec((await dripCounterPage.dropsPerMinute.textContent())!)?.groups
      ?.dpm ?? '0',
  );

  const estimatedTimeInMinutes = round(500 / (dropsPerMinute * 0.05), 0);
  const estimatedTimeInHours = Math.floor(estimatedTimeInMinutes / 60);
  const restTimeInMinutes = estimatedTimeInMinutes % 60;

  await expect(dripCounterPage.estimatedTime).toHaveText(
    `Estimated time: ${estimatedTimeInHours}h ${restTimeInMinutes}m`,
  );
});

test('target time', async ({ dripCounterPage }) => {
  await dripCounterPage.waterAmountInput.fill('100');
  await dripCounterPage.dripRateInput.fill('20');

  await expect(dripCounterPage.targetTime).toHaveText('Target time: 1h 40m');
});

export function round(value: number, precision = 0): number {
  return Number.parseFloat(value.toFixed(precision));
}
