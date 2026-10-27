import { expect, type Locator, type Page } from '@playwright/test';
import { isShown, testJournalEntries } from '../features/app.feature';
import { test } from '../fixtures';
import { legacyStorage, legacySyncHost } from '../fixtures/legacy-storage';

// Same order as src/lib/config/routes.ts, which also defines the Ctrl+<n> shortcuts.
const routes = [
  { label: 'Journal', path: '/' },
  { label: 'My Coffees', path: '/my-coffees' },
  { label: 'Calculator', path: '/calculator' },
  { label: 'Drip Counter', path: '/drip-counter' },
  { label: 'Settings', path: '/settings' },
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(countViewTransitions);
});

// Projects pick tests by tag (see playwright.config.ts): untagged ones run on the phone viewport,
// @desktop ones on the desktop viewport, @local-preview ones only against `vite preview`.
test.describe('phone', () => {
  test('app bar', async ({ page, appPage }) => {
    await expect(page.getByRole('link', { name: 'Coffee Pal' })).toBeVisible();
    await expect(appPage.menuButton).toBeVisible();
    await expect(appPage.navigationRail).toBeHidden();
  });

  test('menu navigates to every route and closes', async ({ page, appPage }) => {
    await gotoReady(page, '/settings');

    for (const route of routes) {
      await appPage.menuButton.click();
      await expect(appPage.menu).toBeVisible();
      await appPage.menu.getByRole('link', { name: route.label, exact: true }).click();

      await expectPath(page, route.path);
      await expect(appPage.menu).toBeHidden();

      await appPage.menuButton.click();
      await expect(
        appPage.menu.getByRole('link', { name: route.label, exact: true }),
      ).toHaveAttribute('aria-current', 'page');
      await page.keyboard.press('Escape');
      await expect(appPage.menu).toBeHidden();
    }
  });

  test('menu closes on backdrop click', async ({ page, appPage }) => {
    await appPage.menuButton.click();
    await expect(appPage.menu).toBeVisible();

    const viewport = page.viewportSize()!;
    await page.mouse.click(viewport.width - 10, viewport.height / 2);

    await expect(appPage.menu).toBeHidden();
    await expectPath(page, '/');
  });

  test('scroll position is restored after navigating back', async ({
    page,
    appPage,
    journalPage,
  }) => {
    const scrollOffset = 800;
    const extraEntries = Array.from({ length: 30 }, (_, i) => ({
      ...testJournalEntries[0],
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    }));
    await appPage.addJournalEntries(extraEntries);
    await reloadReady(page);
    await expect(journalPage.journalList).toHaveCount(20);

    const pageElement = page.locator('#page');
    // Wait for the scroll event, so the app has remembered the position before we navigate away.
    await pageElement.evaluate(
      (element, top) =>
        new Promise<void>((resolve) => {
          element.addEventListener('scroll', () => requestAnimationFrame(() => resolve()), {
            once: true,
          });
          element.scrollTo({ top });
        }),
      scrollOffset,
    );
    expect(await getScrollTop(pageElement)).toBe(scrollOffset);

    // Dispatch the click directly: a real click would first scroll the entry into view.
    await journalPage.getJournalEntry(15).dispatchEvent('click');
    await expectPath(page, /^\/journal\/.+/);
    await page.goBack();
    await expectPath(page, '/');

    await expect
      .poll(async () => Math.abs((await getScrollTop(pageElement)) - scrollOffset))
      .toBeLessThanOrEqual(10);
  });

  test('modal cancel keeps data', async ({ page, appPage, journalPage }) => {
    await openClearIndexedDbDialog(page, appPage.warningDialog);
    await appPage.clickWarningCancelButton();

    await expect(appPage.warningDialog).toBeHidden();
    await journalPage.goto();
    await expect(journalPage.journalList).toHaveCount(3);
    await expect(page).toHaveURL(/\/$/);
  });

  test('modal escape keeps data', async ({ page, appPage, journalPage }) => {
    await openClearIndexedDbDialog(page, appPage.warningDialog);
    await page.keyboard.press('Escape');

    await expect(appPage.warningDialog).toBeHidden();
    await journalPage.goto();
    await expect(journalPage.journalList).toHaveCount(3);
  });

  test('modal confirm deletes data', async ({ page, appPage }) => {
    await openClearIndexedDbDialog(page, appPage.warningDialog);
    await appPage.clickWarningConfirmButton();

    await expect(appPage.warningDialog).toBeHidden();
    await page.goto('/');
    await expect(page.getByText('could not find any entries').first()).toBeVisible();
  });

  test('modal traps focus', async ({ page, appPage }) => {
    await openClearIndexedDbDialog(page, appPage.warningDialog);

    for (const key of ['Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab', 'Shift+Tab']) {
      await page.keyboard.press(key);
      await expect
        .poll(() =>
          appPage.warningDialog.evaluate((dialog) => dialog.contains(document.activeElement)),
        )
        .toBe(true);
    }
  });

  test('toast after deleting an entry can be dismissed', async ({
    appPage,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickJournalEntry(0);
    await journalEntryDetailPage.clickDeleteButton();

    const toast = appPage.toast.filter({ hasText: 'Did you click to fast?' });
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Dismiss toast' }).click();

    await expect(toast).toBeHidden();
    await expect(journalPage.journalList).toHaveCount(2);
  });

  test('sort popup opens and closes', async ({ page, journalPage }) => {
    const option = page.getByRole('option', { name: 'Recently Added' });
    await expectPopupOpensAndCloses(page, {
      open: () => journalPage.clickSortButton(),
      content: option,
      outside: page.getByRole('link', { name: 'Coffee Pal' }),
    });
  });

  test('brew method popup opens and closes', async ({
    page,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickAddButton();
    await expect(journalEntryDetailPage.header).toBeVisible();

    await expectPopupOpensAndCloses(page, {
      open: () => refocus(journalEntryDetailPage.methodInput),
      content: autocompleteOption(page, 'Aeropress'),
      outside: journalEntryDetailPage.header,
    });
  });

  test('brew method popup closes on Escape and keeps focus in the input', async ({
    page,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickAddButton();
    await expect(journalEntryDetailPage.header).toBeVisible();
    const option = autocompleteOption(page, 'Aeropress');

    await refocus(journalEntryDetailPage.methodInput);
    await expect.poll(() => isShown(option)).toBe(true);
    await page.keyboard.press('Escape');

    await expect.poll(() => isShown(option)).toBe(false);
    await expect(journalEntryDetailPage.methodInput).toBeFocused();
  });

  test('coffee type popup opens and closes', async ({
    page,
    journalPage,
    journalEntryDetailPage,
  }) => {
    await journalPage.clickAddButton();
    await expect(journalEntryDetailPage.header).toBeVisible();

    await expectPopupOpensAndCloses(page, {
      open: () => refocus(journalEntryDetailPage.coffeeTypeInput),
      content: autocompleteOption(page, /Rwanda Kamajumba/),
      outside: journalEntryDetailPage.header,
    });
  });

  test('colour scheme survives a reload', async ({ page, settingsPage }) => {
    const html = page.locator('html');

    await settingsPage.getAppearenceOption('Dark').click();
    await expect(html).toHaveClass('dark');
    await reloadReady(page);
    await expect(html).toHaveClass('dark');

    await settingsPage.getAppearenceOption('Light').click();
    await expect(html).not.toHaveClass('dark');
    await reloadReady(page);
    await expect(html).not.toHaveClass('dark');

    await page.emulateMedia({ colorScheme: 'dark' });
    await settingsPage.getAppearenceOption('System').click();
    await expect(html).toHaveClass('dark');
    await reloadReady(page);
    await expect(html).toHaveClass('dark');
  });

  test('sync connection is shown and can be removed', async ({ page, appPage }) => {
    await page.route(`${legacySyncHost}/**`, (route) => route.fulfill({ status: 401 }));
    await appPage.seedLocalStorage({
      sync: JSON.stringify({
        connection: {
          server: { url: legacySyncHost, provider: 'nextcloud' },
          credentials: { username: 'user', password: 'app-password' },
          lastSync: new Date().toISOString(),
        },
      }),
    });

    await gotoReady(page, '/settings');
    await page.getByRole('button', { name: 'Disconnect' }).click();
    await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
    expect(await appPage.getLocalStorageItem('sync')).not.toHaveProperty('connection');

    await reloadReady(page);
    await expect(page.getByRole('button', { name: 'Connect' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Disconnect' })).toBeHidden();
    expect(await appPage.getLocalStorageItem('sync')).not.toHaveProperty('connection');
  });

  test('legacy localStorage data is loaded', async ({ page, appPage }) => {
    await page.route(`${legacySyncHost}/**`, (route) => route.fulfill({ status: 401 }));
    await appPage.seedLocalStorage(legacyStorage);

    await gotoReady(page, '/settings');

    await expect(page.locator('html')).toHaveClass('dark');
    await expect(
      page.getByRole('radio', { name: 'Dark', exact: true, checked: true }).first(),
    ).toBeAttached();
    await expect(
      page.getByRole('radio', { name: 'Imperial', exact: true, checked: true }).first(),
    ).toBeAttached();
    await expect(page.getByRole('button', { name: 'Disconnect' })).toBeVisible();
    await expect(page.getByPlaceholder('Nextcloud Server URL')).toHaveValue('cloud.example.test');
  });

  for (const [name, stored] of [
    ['an unknown colour scheme', '{"colorScheme":"pink"}'],
    ['invalid JSON', '{colorScheme'],
  ]) {
    test(`settings with ${name} fall back to the defaults`, async ({
      page,
      appPage,
      settingsPage,
    }) => {
      await appPage.seedLocalStorage({ settings: stored });

      await gotoReady(page, '/settings');

      await expect(settingsPage.activeAppearenceOption).toHaveText('System');
      await expect(settingsPage.activeUnitsOption).toHaveText('Metric');
      expect(await appPage.getLocalStorageItem('settings')).toEqual({
        colorScheme: 'system',
        preferredUnits: 'metric',
      });
    });
  }

  test('stored dark colour scheme is applied before hydration', async ({ page, appPage }) => {
    await appPage.seedLocalStorage({ settings: legacyStorage.settings });
    // Records <html> as soon as <body> exists: after the inline script in app.html has run, but
    // before SvelteKit hydrates and sets data-test="ready".
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        if (!document.body) {
          return;
        }

        observer.disconnect();
        const html = document.documentElement;
        (globalThis as any).preHydration = {
          className: html.className,
          ready: html.getAttribute('data-test') === 'ready',
        };
      });
      observer.observe(document, { childList: true, subtree: true });
    });

    await gotoReady(page, '/');

    expect(await page.evaluate(() => (globalThis as any).preHydration)).toEqual({
      className: 'dark',
      ready: false,
    });
  });

  test('coffee theme keeps the v2 palette', async ({ page }) => {
    await gotoReady(page, '/');

    // The build minifies colours (e.g. to hex), so each variable is resolved as a computed colour.
    const palette = await page.evaluate(() => {
      const probe = document.body.appendChild(document.createElement('span'));
      const colors = [
        'primary',
        'secondary',
        'tertiary',
        'success',
        'warning',
        'error',
        'surface',
      ].map((name) => {
        probe.style.color = `var(--color-${name}-500)`;
        return [name, getComputedStyle(probe).color];
      });
      probe.remove();
      return colors;
    });

    // The 500 shades of the v2 theme.ts.
    expect(Object.fromEntries(palette)).toEqual({
      primary: 'rgb(1, 99, 103)',
      secondary: 'rgb(142, 52, 18)',
      tertiary: 'rgb(175, 80, 14)',
      success: 'rgb(29, 184, 52)',
      warning: 'rgb(234, 179, 8)',
      error: 'rgb(165, 25, 25)',
      surface: 'rgb(14, 37, 94)',
    });
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`mesh background is shown in ${colorScheme} mode`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await gotoReady(page, '/');

      await expect(page.locator('html')).toHaveClass(colorScheme === 'dark' ? 'dark' : '');
      expect(await page.evaluate(() => getComputedStyle(document.body).backgroundImage)).toContain(
        'radial-gradient',
      );
    });
  }

  test(
    'service worker serves the app offline',
    { tag: '@local-preview' },
    async ({ page, context, journalPage }) => {
      await expect
        .poll(() => page.evaluate(() => navigator.serviceWorker.ready.then((r) => !!r.active)))
        .toBe(true);

      await context.setOffline(true);
      try {
        await page.reload();
        await expect(journalPage.journalList).toHaveCount(3);
      } finally {
        await context.setOffline(false);
      }
    },
  );

  test('keyboard shortcuts navigate to the routes in order', async ({ page }) => {
    await gotoReady(page, '/settings');

    for (const [index, route] of routes.entries()) {
      await page.keyboard.press(`Control+${index + 1}`);
      await expectPath(page, route.path);
    }

    await page.keyboard.press(`Control+${routes.length + 1}`);
    // Asserting that nothing happens needs an observation window: the app calls preventDefault()
    // for every Ctrl+digit, so there is no event to wait for.
    await page.waitForTimeout(500); // NOSONAR(typescript:S2925)
    await expectPath(page, routes.at(-1)!.path);
  });
});

test.describe('desktop', { tag: '@desktop' }, () => {
  test('navigation rail navigates and marks the active route', async ({ page, appPage }) => {
    await expect(appPage.navigationRail).toBeVisible();
    await expect(appPage.menuButton).toBeHidden();

    for (const route of [...routes].reverse()) {
      await appPage.navigationRail.getByRole('link', { name: route.label, exact: true }).click();
      await expectPath(page, route.path);

      for (const other of routes) {
        const link = appPage.navigationRail.getByRole('link', { name: other.label, exact: true });
        if (other === route) {
          await expect(link).toHaveAttribute('aria-current', 'page');
        } else {
          await expect(link).not.toHaveAttribute('aria-current');
        }
      }
    }
  });
});

async function gotoReady(page: Page, path: string): Promise<void> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}

async function reloadReady(page: Page): Promise<void> {
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-test', 'ready');
}

// Skeleton v2 autocompletes open on focus, so a focused input has to be blurred to reopen it.
async function refocus(input: Locator): Promise<void> {
  await input.blur();
  await input.click();
}

async function expectPath(page: Page, path: string | RegExp): Promise<void> {
  await expect(page).toHaveURL((url) =>
    typeof path === 'string' ? url.pathname === path : path.test(url.pathname),
  );
  await waitForViewTransitions(page);
}

// The app ignores navigations that start while a view transition is running (they never finish),
// so let each transition end before the next navigation.
async function waitForViewTransitions(page: Page): Promise<void> {
  await page.waitForFunction(
    () => ((window as ViewTransitionCounter).__viewTransitions ?? 0) === 0,
  );
}

type ViewTransitionCounter = Window & { __viewTransitions?: number };

function countViewTransitions(): void {
  const counter = window as ViewTransitionCounter;
  const startViewTransition = document.startViewTransition?.bind(document);
  if (!startViewTransition) {
    return;
  }

  counter.__viewTransitions = 0;
  document.startViewTransition = ((...args: Parameters<typeof startViewTransition>) => {
    counter.__viewTransitions! += 1;
    const transition = startViewTransition(...args);
    transition.finished.finally(() => (counter.__viewTransitions! -= 1));
    return transition;
  }) as typeof document.startViewTransition;
}

function getScrollTop(locator: Locator): Promise<number> {
  return locator.evaluate((element) => Math.round(element.scrollTop));
}

function autocompleteOption(page: Page, name: string | RegExp): Locator {
  // Skeleton v2 renders autocomplete options as buttons; later versions use the option role.
  return page
    .getByRole('button', { name, exact: true })
    .or(page.getByRole('option', { name, exact: true }));
}

async function openClearIndexedDbDialog(page: Page, dialog: Locator): Promise<void> {
  await gotoReady(page, '/settings');
  await page.getByRole('switch', { name: 'Toggle Developer Settings' }).click();
  await page.getByRole('button', { name: 'Clear IndexedDB' }).click();

  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Are you sure that you want to clear the IndexedDB?');
}

async function expectPopupOpensAndCloses(
  page: Page,
  { open, content, outside }: { open: () => Promise<void>; content: Locator; outside: Locator },
): Promise<void> {
  await open();
  await expect.poll(() => isShown(content)).toBe(true);
  await page.keyboard.press('Escape');
  await expect.poll(() => isShown(content)).toBe(false);

  await open();
  await expect.poll(() => isShown(content)).toBe(true);
  await outside.click();
  await expect.poll(() => isShown(content)).toBe(false);
}
