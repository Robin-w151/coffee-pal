import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('drip counter 3 taps', async ({ page, dripCounterPage }) => {
  for (const timeout of [0, 1000, 2000]) {
    await page.waitForTimeout(timeout);
    await dripCounterPage.clickTapButton();
  }

  await expect(dripCounterPage.dropsPerMinute).toHaveText(/^[23]\d drops\/min$/i);
});

test('drip counter reset', async ({ dripCounterPage }) => {
  await dripCounterPage.clickTapButton();
  await dripCounterPage.clickResetButton();

  await expect(dripCounterPage.startMessage).toBeVisible();
});

test('drip counter estimation', async ({ page, dripCounterPage }) => {
  for (const timeout of [0, 100, 1000]) {
    await page.waitForTimeout(timeout);
    await dripCounterPage.clickTapButton();
  }

  const dropsPerMinute = parseInt(
    /(?<dpm>\d+) drops\/min/.exec((await dripCounterPage.dropsPerMinute.textContent())!)?.groups
      ?.dpm ?? '0',
  );

  const estimatedTimeInMinutes = round(500 / (dropsPerMinute * 0.05), 0)!;
  const estimatedTimeInHours = Math.floor(estimatedTimeInMinutes / 60);
  const restTimeInMinutes = estimatedTimeInMinutes % 60;

  await expect(dripCounterPage.estimatedTime).toHaveText(
    `Estimated time: ${estimatedTimeInHours}h ${restTimeInMinutes}m`,
  );
});

export function round(value: number, precision = 0): number {
  return parseFloat(value.toFixed(precision));
}
