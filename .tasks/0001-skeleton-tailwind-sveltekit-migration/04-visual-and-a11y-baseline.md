# 04: Visual and accessibility baseline

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 01
**Size:** M — Playwright screenshots and axe are standard, but getting them deterministic (dates, version hash, animations, mesh background) needs iteration.

## User story

As Claude, I want screenshots of every screen and state on v2, plus an accessibility baseline, so that phase 1 can be checked strictly for "nothing changed", and later phases can be compared and judged.

## Description

1. **Visual suite**, separate from the e2e suite so it never runs in GitHub Actions:
   - `playwright.visual.config.ts` with `testDir: './tests/visual'`, the same local `webServer` as story 01, projects `phone` (576×768) and `desktop` (1280×800), `expect.toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 }`, and `snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}'`. Snapshots are taken on macOS and committed.
   - Scripts: `test:visual:run` (`playwright test -c playwright.visual.config.ts`), `test:visual` (`pnpm build && pnpm test:visual:run`), `test:visual:update` (`pnpm build && pnpm test:visual:run --update-snapshots`). `webServer` only runs `vite preview`, so the standalone scripts build first; otherwise they'd screenshot whatever build is lying around (e.g. from another branch). Reporter as in story 01: `[['html', { open: 'never' }], ['list']]`.
   - Reuse the seeded data from [tests/fixtures.ts](../../tests/fixtures.ts). Freeze time with `page.clock.setFixedTime(...)`. Mask dynamic content (`mask: [...]`): app version and commit hash in settings, sync timestamps.
   - **Screens × states**, each in light and dark: journal list, journal entry (`/journal/[id]`), new journal entry (`/journal/new`), my-coffees list / entry / new, calculator, drip counter, settings; empty state (no entries); app menu drawer open (phone); rail (desktop); confirm modal open (dangerous variant); a toast visible; each popup open (Method, CoffeeType, PageSearch); autocomplete suggestions open; validation errors (e.g. empty water amount on a journal entry, empty name on a coffee).
   - Name screenshots `<screen>-<state>-<scheme>.png` so the human can find them.
2. **Accessibility suite** in the e2e suite (so it runs in `verify`):
   - Add `@axe-core/playwright` (devDependency). `tests/specs/a11y.spec.ts` runs `AxeBuilder` on each route in light and dark, with tags `wcag2a`, `wcag2aa`.
   - Compare against the baseline in `tests/a11y/baseline/`: one file per case, `<route-slug>-<scheme>.json`, containing `{ ruleId, count }[]` (one file per case so parallel workers never write the same file). Fail when a `ruleId` appears that isn't in the case's baseline, or when its `count` grows. Print the targets of failing rules for debugging, but don't store them: axe targets are CSS selectors that change with every markup change (phases 1–3), so matching on them would report old violations as new. Lower counts are reported as a note (the baseline can be shrunk). With `A11Y_UPDATE_BASELINE=1` the spec rewrites the baseline files.
   - Generate the initial baseline from today's state.
3. **`verify:strict`** script: `pnpm verify && pnpm test:visual:run` (`verify` already built).
4. Run the visual suite 3 times in a row. If anything differs, fix the flakiness (masking, waits, fixed time) before finishing.

## Acceptance criteria

- [x] `pnpm test:visual` passes 3 consecutive runs without updating snapshots.
- [x] Every screen × state × scheme listed above has a committed screenshot in `tests/visual/__screenshots__/{phone,desktop}/` (desktop only for screens where layout differs, at least journal list and settings).
- [x] `pnpm test:e2e` (CI/Test workflow) doesn't run the visual tests.
- [x] The a11y spec passes on today's app; `tests/a11y/baseline/` is committed; introducing a missing label in a test branch makes it fail.
- [x] Given a markup change that keeps the same violations (e.g. wrapping an element in an extra `<div>`), when the a11y spec runs, then it still passes.
- [x] Given `A11Y_UPDATE_BASELINE=1 pnpm test:e2e:local`, when it runs with several workers, then every baseline file is valid JSON and a second update run produces no diff.
- [x] `pnpm verify:strict` is green.
- [x] PROGRESS.md lists the screenshot inventory (count per project) and the number of baseline a11y violations by rule.

## Technical notes

- Files: `playwright.visual.config.ts` (new), `tests/visual/*.visual.ts` (new), `tests/specs/a11y.spec.ts` (new), `tests/a11y/baseline/*.json` (new), [package.json](../../package.json), [.prettierignore](../../.prettierignore) (ignore `tests/visual/__screenshots__`), [eslint.config.js](../../eslint.config.js) if needed.
- The fixed mesh background (`background-attachment: fixed` in [src/app.scss](../../src/app.scss)) is deterministic but large; if diffs show noise there, use `fullPage: false` screenshots.
- Set the colour scheme with `page.emulateMedia({ colorScheme })` and the default `system` setting, in both the visual and the a11y suite. Persisting the choice in settings is covered by story 02.
- Make sure [tests/visual](../../tests) isn't matched by the default `testDir: './tests'` of the e2e config: add `testIgnore: ['visual/**']` there.

- **As built (2026-10-25):**
  - Time: `page.clock.install({ time })` instead of `setFixedTime`. A frozen `Date.now` stalls rxjs `debounceTime`, so lists never load; `install()` starts at a fixed moment and lets time flow.
  - Every screenshot masks the app version, the storage estimate and the "Install App" / "Check for Updates" buttons (they depend on service worker and install prompt timing). Settings shots also wait for "Check for Updates".
  - `expectScreenshot()` waits until `#page` keeps the same scroll position over ~450 ms; the Developer section starts a smooth scroll 150 ms after it opens. The modal shot also scrolls `#page` to the bottom first, so the background is identical every run.
  - Base screens run on `phone` and `desktop`; the states (empty, menu, popups, toast, validation, modal) on `phone` only. The rail is part of every desktop shot. Inventory: 46 phone + 26 desktop = 72 screenshots (~16 MB), including the states added at checkpoint 05 (calculator sections, drip counter and search run on both projects).
  - The screen list (paths + "rendered" checks) lives in `tests/features/screens.ts` and is shared by the visual suite and `a11y.spec.ts`.
  - Visual config also pins `locale: en-US` and `timezoneId: Europe/Vienna`.
  - `APP_VERSION` comes from `npm_package_version`: start the dev server with `pnpm dev`, not `pnpm exec vite dev`, or the empty version link adds a `link-name` violation on settings.
  - A text-colour change on `.h3` was caught in only 2 of the screenshots that contain one, because small text stays under `maxDiffPixelRatio: 0.01`. Worth keeping in mind when reviewing phase 1 diffs.

## Testing

See acceptance criteria; include a deliberate CSS change in a scratch commit to prove a diff is detected, then drop it.

## Out of scope

- Approving the baseline (05). Updating the baseline after the redesign (19).
