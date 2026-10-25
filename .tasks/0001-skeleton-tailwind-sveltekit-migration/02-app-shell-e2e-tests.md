# 02: E2e tests for app shell and overlays

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** In progress
**Depends on:** 01
**Size:** M — many small tests in an existing page-object setup; some uncertainty about service-worker and offline testing in Playwright.

## User story

As Claude, I want e2e tests for everything the layout and overlay rewrite will touch, so that a green e2e run in phases 1–4 means the app shell still behaves the same.

## Description

Add tests to [tests/specs](../../tests/specs) (a new `appShell.spec.ts`, plus extensions of existing specs where they fit), using the page objects in [tests/pages](../../tests/pages) and [tests/features/app.feature.ts](../../tests/features/app.feature.ts). Prefer `getByRole`/`getByLabel`/`getByText`. Where no accessible name exists, add an **app-owned** `data-testid` to the app markup (not to Skeleton internals). Any change under `src/` makes the phase 0 merge a releasable `fix:` (see "Releases and deploys" in the epic), so production gets the same markup the nightly Test run expects.

Behaviours to cover:

1. **Navigation, phone (576 px, the default project):** the app bar is visible; the menu button opens the drawer (`AppMenu`); every menu entry navigates to its route; the drawer closes after navigation and on Escape / backdrop click.
2. **Navigation, desktop:** add a second Playwright project `chromium-desktop` (1280×800) that runs only `appShell.spec.ts` (`testMatch`). The rail (`AppRail`) is visible, the active route is marked (`aria-current` or the equivalent; assert on what exists today), and clicking each entry navigates.
3. **Scroll restoration:** seed at least 30 extra journal entries in this test (generate them from `testJournalEntries[0]` with new ids via `appPage.addJournalEntries`), scroll `#page` to a fixed offset (e.g. 1200 px), open an entry, go back, and assert that `#page`'s `scrollTop` is within ±10 px of the offset (feature in [AppLayout.svelte](../../src/lib/components/shared/app/AppLayout.svelte) via `rememberScrollPosition`). The 3 entries from the `appPage` fixture don't make the list scrollable.
4. **Modal:** a confirm/cancel flow on a destructive action (e.g. deleting a journal entry). Cancel keeps the entry; confirm removes it; Escape cancels; focus is trapped in the dialog while it's open. After **cancel**, assert where focus actually lands on v2 today: if it returns to the trigger, assert that; if not, record it in PROGRESS.md as a known gap (story 16 adds focus return). Replace the existing `.modal` locator with `getByRole('dialog')`.
5. **Toast:** clicking delete twice quickly on a journal entry shows "Did you click to fast?" ([JournalEntryDetail.svelte](../../src/lib/components/journal/JournalEntryDetail.svelte)); it disappears after its timeout or can be dismissed.
6. **Popups:** the popups used in [Method.svelte](../../src/lib/components/journal/detail/Method.svelte), [CoffeeType.svelte](../../src/lib/components/journal/detail/CoffeeType.svelte) and [PageSearch.svelte](../../src/lib/components/shared/elements/page/PageSearch.svelte) open on their trigger, show their content and close on outside click / Escape.
7. **Colour scheme:** switching light/dark/system in settings toggles the `dark` class on `<html>` (existing `locator('html')` assertions can be reused), **and the choice survives a reload** (this guards the localStorage migration in story 06).
8. **Sync connection persistence:** seed `localStorage.sync` with a fake connection in the shape of [src/lib/models/sync.ts](../../src/lib/models/sync.ts) via `page.addInitScript` (seed once, see Technical notes). The settings page shows it as connected after load, and removing it clears `localStorage.sync.connection`, also after a reload. Don't trigger a real WebDAV request: answer requests to the fake host with `page.route` (see Technical notes).
9. **Legacy data format:** seed `localStorage.settings` and `localStorage.sync` with values exactly as Skeleton v2 `localStorageStore` writes them today (capture the format by reading `localStorage` in a test first and hard-code it as a fixture in `tests/fixtures/legacy-storage.ts`). The app loads them correctly. This test must keep passing unchanged through the whole epic.
10. **PWA (local preview only):** `test.skip(process.env['TEST_LOCAL_PREVIEW'] !== '1', 'needs the local production preview')`. After load, a service worker is registered and active; after `context.setOffline(true)` a reload still renders the journal page.
11. **Keyboard shortcuts** ([EnableShortcuts.svelte](../../src/lib/components/shared/app/EnableShortcuts.svelte)): Ctrl+1 … Ctrl+5 navigate to the 5 routes in [src/lib/config/routes.ts](../../src/lib/config/routes.ts) order (Journal, My Coffees, Calculator, …); Ctrl+6 does nothing.

## Acceptance criteria

- [x] All behaviours 1–11 have at least one test; each test fails if the behaviour is removed (check by temporarily breaking one case per area, then revert).
- [x] No test uses Skeleton class names as selectors: `grep -rnE "['\"\`][^'\"\`]*\.(modal|toast|drawer|app-rail|popup)\b|variant-|-token" tests` → no matches.
- [x] `pnpm verify` is green; the suite passes 3 consecutive local runs (no flakiness).
- [ ] The Test workflow passes against the branch's Vercel preview (it runs automatically on each preview deployment), and a plain `pnpm test:e2e` against the dev server still passes: tests that need the local preview are skipped there, not failing.

## Technical notes

- [playwright.config.ts](../../playwright.config.ts): add the `chromium-desktop` project.
- Existing helpers: `appPage` fixture (auto, seeds journal and coffee entries) in [tests/fixtures.ts](../../tests/fixtures.ts).
- `document.documentElement` gets `data-test="ready"` on mount; use it as the readiness signal.
- Service worker: `await page.evaluate(() => navigator.serviceWorker.ready.then(r => !!r.active))`.
- Seed localStorage only once per test: in the init script, write only if `sessionStorage.getItem('seeded')` is unset, then set it. `addInitScript` runs before every load, so without the guard a reload restores the seeded values and hides what the app wrote.
- For the sync tests, answer WebDAV requests to the fake host with `page.route(..., route => route.fulfill({ status: 401 }))`, and assert the expected sync error toast ([sync.ts](../../src/lib/services/sync/sync.ts) shows one) or dismiss it before the next step. Don't leave requests hanging.

- **As built (2026-10-25):**
  - Behaviour 4 uses the Developer settings action "Clear IndexedDB" (deleting a journal entry has no confirm dialog). After cancel, focus lands on `<body>`, not on the trigger: known gap for story 16, not asserted.
  - Behaviour 5: a single delete already shows the "Did you click to fast?" toast (with Undo); the test dismisses it via "Dismiss toast".
  - Behaviour 3 scrolls to 800 px: with 33 entries (20 per page) the page only scrolls ~1010 px on the phone viewport.
  - App-owned markup added: `aria-current="page"` on rail and menu links, and the rail wrapper became `<nav aria-label="Main navigation">`. So the phase 0 merge is a releasable `fix:`.
  - Skeleton v2 closes popups with `opacity: 0` + `inert`, which Playwright still counts as visible; `isShown()` in [app.feature.ts](../../tests/features/app.feature.ts) checks "rendered, opaque and not inert" instead.
  - The app drops navigations that start while a view transition runs (see Out of scope). `appShell.spec.ts` counts running view transitions via an init script and waits for 0 after each navigation.
  - The `journalPage`/`myCoffeesPage` fixtures now wait for `data-test="ready"` before opening the sort popup; without it, existing specs were flaky against the dev server.

## Testing

This story _is_ tests. Record new test count and runtime in PROGRESS.md.

## Out of scope

- Form controls (03), screenshots and axe (04).
- **Bug found, not fixed (2026-10-25):** `runViewTransition` ([viewTransition.ts](../../src/lib/shared/viewTransition.ts)) returns without calling its callback when a transition is already running. `onNavigate` in AppLayout then never resolves, so a navigation started during another navigation's transition (e.g. a quick back tap) hangs: the URL changes but the old page stays. Candidate for story 07 (own app layout) or a separate fix.
