import { expect } from '@playwright/test';
import { test } from '../fixtures';

test('appearence system', async ({ page, settingsPage }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await settingsPage.getAppearenceOption('System').click();
  await settingsPage.goto();

  await expect(settingsPage.activeAppearenceOption).toHaveText('System');
  await expect(page.locator('html')).toHaveClass('dark');
});

test('appearence light', async ({ page, settingsPage }) => {
  await settingsPage.getAppearenceOption('Light').click();
  await settingsPage.goto();

  await expect(settingsPage.activeAppearenceOption).toHaveText('Light');
  await expect(page.locator('html')).not.toHaveClass('dark');
});

test('appearence dark', async ({ page, settingsPage }) => {
  await settingsPage.getAppearenceOption('Dark').click();
  await settingsPage.goto();

  await expect(settingsPage.activeAppearenceOption).toHaveText('Dark');
  await expect(page.locator('html')).toHaveClass('dark');
});

test('units metric', async ({ settingsPage }) => {
  await settingsPage.getUnitsOptions('Metric').click();
  await settingsPage.goto();

  await expect(settingsPage.activeUnitsOption).toHaveText('Metric');
});

test('units imperial', async ({ settingsPage }) => {
  await settingsPage.getUnitsOptions('Imperial').click();
  await settingsPage.goto();

  await expect(settingsPage.activeUnitsOption).toHaveText('Imperial');
});
