import { expect, type Locator, type Page } from '@playwright/test';
import { test as base } from '../fixtures';

export const colorSchemes = ['light', 'dark'] as const;
export type ColorScheme = (typeof colorSchemes)[number];

const fixedTime = new Date('2026-01-15T10:00:00+01:00');
const desktopMinWidth = 768;

export const test = base.extend({
  page: async ({ page }, use) => {
    // install() starts at a fixed time but lets it flow: a frozen Date.now would stall rxjs debounces.
    await page.clock.install({ time: fixedTime });
    await use(page);
  },
});

export { expect };

export function skipUnlessPhone(): void {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= desktopMinWidth, 'phone layout only');
}

export async function gotoReady(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}

/**
 * Takes the viewport screenshot `<name>-<scheme>.png` once fonts are loaded and the page has
 * stopped scrolling. Viewport (not full page) keeps the fixed mesh background stable.
 */
export async function expectScreenshot(
  page: Page,
  name: string,
  colorScheme: ColorScheme,
  { mask = [] }: { mask?: Array<Locator> } = {},
): Promise<void> {
  await page.evaluate(() => document.fonts.ready);
  await waitForScrollToSettle(page);
  await expect(page).toHaveScreenshot(`${name}-${colorScheme}.png`, {
    mask: [...dynamicContent(page), ...mask],
  });
}

// App version, storage estimate and buttons that depend on service worker / install prompt timing.
function dynamicContent(page: Page): Array<Locator> {
  return [
    page.locator('li', { hasText: 'Version' }).locator('span').nth(1),
    page.locator('li', { hasText: 'Storage usage' }).locator('strong'),
    page.getByRole('button', { name: /Install App|Check for Updates/ }),
  ];
}

// Requires the same scroll position over several polls: some sections start a smooth scroll
// only after a short delay.
export async function waitForScrollToSettle(page: Page): Promise<void> {
  let previous = -1;
  let stablePolls = 0;
  await expect
    .poll(
      async () => {
        const current = await page.locator('#page').evaluate((element) => element.scrollTop);
        stablePolls = current === previous ? stablePolls + 1 : 0;
        previous = current;
        return stablePolls;
      },
      { intervals: [150] },
    )
    .toBeGreaterThanOrEqual(3);
}

export async function clearAllEntries(page: Page): Promise<void> {
  await Promise.all(['journal', 'my-coffees'].map((dbName) => page.evaluate(clearStore, dbName)));
}

// Runs in the browser, so it must not reference anything outside itself.
function clearStore(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const openRequest = indexedDB.open(dbName);
    openRequest.onerror = reject;
    openRequest.onsuccess = () => {
      const tx = openRequest.result.transaction(['entries'], 'readwrite');
      tx.objectStore('entries').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = reject;
    };
  });
}
