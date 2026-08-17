import { expect, type Page } from '@playwright/test';

/**
 * Waits for the app to finish hydrating.
 *
 * Skeleton v5 components attach their behaviour on mount, so interacting with
 * one before this resolves silently does nothing.
 */
export async function waitForTestReady(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}

/**
 * Waits for an entry list to finish reloading.
 *
 * Search and sort changes are debounced before they hit the database, so the
 * list still shows the previous result for a moment after interacting with it.
 */
export async function waitForListLoaded(page: Page): Promise<void> {
  await expect(page.locator('[data-loading]').first()).toHaveAttribute('data-loading', 'false');
}
