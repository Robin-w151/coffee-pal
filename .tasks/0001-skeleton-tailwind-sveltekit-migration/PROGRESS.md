# Progress log: Epic 0001

A running log of the migration, written by Claude after each story (see "How Claude works through this epic" in the [epic README](README.md)). Each entry records the story, the `pnpm migration:status` numbers, the gate results, notable decisions, and open issues. Newest entries go at the bottom.

## 2026-10-25 — Story 01: Verify and migration-status scripts

**Branch:** `migration/0-safety-net`

**`pnpm migration:status`** (Count = occurrences or files, depending on the category; Files = files with a hit):

| Category                       | Count | Files | Phase |
| ------------------------------ | ----: | ----: | ----: |
| skeleton-v2-imports-outside-ui |    31 |    31 |     1 |
| local-storage-store            |     2 |     2 |     1 |
| app-shell                      |     1 |     1 |     1 |
| conic-gradient                 |     1 |     1 |     1 |
| scss                           |     3 |     3 |     1 |
| skeleton-apply-in-app-css      |     9 |     1 |     1 |
| tailwind-v3                    |    10 |     5 |     2 |
| skeleton-v2-imports-total      |    31 |    31 |     2 |
| v2-classes                     |    92 |    39 |     2 |
| migration-placeholders         |     0 |     0 |     2 |
| skeleton-v4-only               |     0 |     0 |     3 |
| sveltekit-2                    |   282 |    93 |     4 |

**Gates:** `pnpm verify` green twice in a row (31 s and 28 s; 168 unit tests, 63 e2e tests against `vite preview` on port 4173; no server left on 4173 between runs). A forced unit test failure stops `verify` at `test:unit` with exit 1; a forced e2e failure exits 1 in ~2 s without opening a report.

**Decisions:**

- The 11 svelte-check warnings (`state_referenced_locally`, all intentional one-time copies of props into local `$state`) were fixed by wrapping the reads in `untrack(() => …)`, as the code already does elsewhere. No behaviour change. So `verify` uses `check:strict` from the start; story 11 doesn't need to switch it.
- `pnpm` isn't on `PATH` on the dev machine (it runs through `corepack pnpm`, like `.husky/pre-commit`), so `verify` and the Playwright `webServer` call `corepack pnpm …` instead of `pnpm …`. Reverted later the same day: pnpm is now enabled via corepack and on `PATH`, so scripts call `pnpm` as specified.
- `sveltekit-2` counts every `'$lib/…'` string (276 today), not only extensionless imports, because SvelteKit 3 replaces `$lib` completely.
- `tailwind-v3` is 10: three config files (`tailwind.config.ts`, `postcss.config.js`, `theme.ts`), four `@tailwind` directives in `src/app.scss` (including `variants`), and three package.json dependencies.

**Open issues:** none.

## 2026-10-25 — Story 02: E2e tests for app shell and overlays

**Branch:** `migration/0-safety-net`

**`pnpm migration:status`:** unchanged from story 01 (no Skeleton usage changed).

**Tests:** new `tests/specs/appShell.spec.ts` with 18 tests (17 phone, 1 desktop on the new `chromium-desktop` project). The e2e suite is now 81 tests, ~18 s in `vite preview`; `pnpm verify` ~34 s.

**Gates:** `pnpm verify` green 3 times in a row; `appShell.spec.ts` green 10× with `--repeat-each 10` (180/180); plain `pnpm test:e2e` against `vite dev` green 3 times in a row (PWA test skipped). Test workflow against the Vercel preview of `4209c05`: 80 passed, 19 skipped (run 40222268139). Breaking one behaviour per area (menu close, rail `aria-current`, scroll memory, confirm dialog, delete toast, sort popup, settings persistence, sync disconnect, offline service worker, shortcut mapping) made the matching tests fail; all reverted.

**Decisions:**

- Modal tests use "Clear IndexedDB" in the Developer settings (the only destructive confirm dialog; deleting a journal entry uses an undo toast instead).
- Added app-owned markup: `aria-current="page"` on rail and menu links, `<nav aria-label="Main navigation">` around the rail. `src/` changed, so the phase 0 PR title is the `fix:` variant.
- `isShown()` test helper: v2 popups close via `opacity: 0` + `inert`, which Playwright treats as visible.
- `journalPage` / `myCoffeesPage` fixtures now wait for hydration before opening the sort popup (they were flaky against the dev server).

**Known gaps / open issues:**

- **Focus return:** after cancelling the confirm dialog, focus lands on `<body>`, not on the button that opened it. Story 16 adds focus return.
- **View transition bug (not fixed):** `runViewTransition` skips its callback while another transition runs, so a navigation that starts during a running transition never completes (URL changes, old page stays). Tests wait for transitions to finish. Noted in story 02 → Out of scope; candidate for story 07.

## 2026-10-25 — Story 03: E2e tests for form controls

**Branch:** `migration/0-safety-net`

**`pnpm migration:status`:** unchanged (only test hooks added under `src/`).

**Tests:** 18 new tests; the e2e suite is now 99 tests, ~21 s in `vite preview`; `pnpm verify` ~37 s.

| Component (v2)                         | New tests | Where                                                                     |
| -------------------------------------- | --------: | ------------------------------------------------------------------------- |
| Autocomplete                           |         3 | journal (filter, ArrowDown + Enter, click); plus 2 popup tests from 02    |
| ListBox / ListBoxItem                  |         2 | journal sort (`aria-selected`, keyboard); plus the existing sort tests    |
| Paginator                              |         1 | journal (45 entries, all four buttons and disabled states)                |
| InputChip                              |         3 | my coffees (colours, add / duplicate / remove / save, Escape guard)       |
| FileDropzone                           |         2 | settings (import 300 + 100 entries, malformed file)                       |
| RangeSlider                            |         1 | calculator (keyboard); plus 3 existing ice-ratio tests                    |
| Ratings                                |         1 | journal (set 4, save, clear, save)                                        |
| SlideToggle                            |         1 | calculator (`aria-checked`); existing tests now use `getByRole('switch')` |
| RadioGroup / RadioItem                 |         1 | settings; the 5 existing tests now use `getByRole('radio', { checked })`  |
| input-group (Measurement, Url, Estim.) |         3 | journal (unit conversion + stored base value), settings, drip counter     |

**Gates:** `pnpm verify` green 3 times in a row; the full e2e suite green with `--repeat-each 5` (495/495); plain `pnpm test:e2e` against `vite dev` green 3 times in a row; Test workflow against the Vercel preview of `861bc5b`: 98 passed, 19 skipped (run 40223727539). Breaking one behaviour per component (autocomplete selection, list box binding, page change, chip colours, file binding, slider binding, rating change, toggle binding, radio binding, unit binding) made the matching tests fail; all reverted.

**Decisions:** see story 03 → Technical notes → As built (test hooks on Rating and Aromas wrappers, IndexedDB polling after saves, seeded backup generator).

**Open issues:** none new.

## 2026-10-25 — Story 04: Visual and accessibility baseline

**Branch:** `migration/0-safety-net`

**`pnpm migration:status`:** unchanged (no `src/` changes).

**Screenshot inventory** (`tests/visual/__screenshots__/`, macOS, ~9.6 MB):

| Project | Screens (9 × 2 schemes) | States (10 × 2 schemes) | Total |
| ------- | ----------------------: | ----------------------: | ----: |
| phone   |                      18 |                      20 |    38 |
| desktop |                      18 |                       – |    18 |

States (phone): journal list empty, app menu open, sort popup open, toast, brew method suggestions (open and filtered), coffee type suggestions, journal entry validation, coffee validation, dangerous confirm modal.

**A11y baseline** (`tests/a11y/baseline/`, 18 files, axe `wcag2a` + `wcag2aa`), violations by rule, summed over all screens and both schemes:

| Rule                 | Nodes | Where                                                     |
| -------------------- | ----: | --------------------------------------------------------- |
| `dlitem`             |    24 | journal and my-coffees lists (`<dt>`/`<dd>` inside `<a>`) |
| `nested-interactive` |    10 | settings (5 per scheme)                                   |
| `document-title`     |     8 | journal / my-coffees entry and new pages (no `<title>`)   |
| `definition-list`    |     4 | journal and my-coffees lists                              |
| `label`              |     2 | settings (1 per scheme)                                   |

No `color-contrast` violations: axe reports text over the mesh background as "incomplete", not as a violation.

**Gates:** `pnpm verify:strict` green (117 e2e, 56 visual); `pnpm test:visual` green 3 times in a row (and `test:visual:run` 5 times); the e2e suite against `pnpm dev` green 3 times. `A11Y_UPDATE_BASELINE=1 pnpm test:e2e:local` twice with parallel workers: valid JSON, no diff. Wrapping the journal list in an extra `<div>` kept the a11y spec green; removing the menu button's accessible name failed all 18 a11y cases (`button-name`), and a `.h3` colour change failed 2 screenshots.

**Decisions:** see story 04 → Technical notes → As built. New devDependency `@axe-core/playwright@4.14.0`; installing it added a `supports-color@7.2.0` peer suffix to many lockfile entries, with no version changes.

**Open issues for checkpoint 05:**

- `maxDiffPixelRatio: 0.01` lets small text-colour changes through on most screens; the human may want a stricter threshold for phase 1.
- Known gaps from story 02 (focus return after modal cancel, view transition bug) still apply.

## 2026-10-25 — Checkpoint 05 feedback: more screenshot states

**Requested by the human:** calculator with both optional sections on, drip counter within and outside the target rate, active search.

**Added** (phone, light + dark, 8 screenshots; inventory now 46 phone + 18 desktop = 64):

- `calculator-sections`: Iced Coffee and Temperature Converter switched on.
- `drip-counter-within-target` / `drip-counter-outside-target`: taps exactly 1 s / 0.5 s apart via the paused fake clock (60 vs 120 drops/min against the default target of 60).
- `journal-list-search`: search "PuckPuck" active with one result.

Calculator and drip counter scroll inside `#page`, so these tests grow the viewport to 576×1400 to capture the whole page.

**Gates:** the new tests green with `--repeat-each 10` (80/80); `pnpm test:visual` green 3 times in a row (64/64); `pnpm lint` green.

**Follow-up (same day):** at the human's request the calculator, drip counter and search states also run on `desktop`, where their layout differs (two-column calculator, counter and estimation side by side, journal table). The search test no longer uses the `journalPage` fixture, which checks the phone list; the phone search screenshots were regenerated accordingly. Inventory now 46 phone + 26 desktop = 72 (~16 MB). Gates: the cross-layout tests green with `--repeat-each 10` (160/160); `pnpm test:visual` green 3 times in a row (72/72).

## 2026-10-25 — Checkpoint 05: SonarCloud findings on PR #186

The quality gate failed on reliability (D) and security (C). Fixed:

- `migration-status.js`: compare function for `sort()` (bug); the three backtracking regexes are now simple candidate regexes plus a `select` filter (output identical: same counts and files in all 12 categories); the `git` PATH lookup is marked `NOSONAR` (local dev script).
- `generate-backup.js`: `--out` must resolve inside the repository (path traversal). The fixture regenerates byte-identically.
- `appShell.spec.ts`: no more `test.skip`. Projects select tests by tag: `@desktop` runs only on `chromium-desktop`, `@local-preview` only with `TEST_LOCAL_PREVIEW=1` (see `playwright.config.ts`). The Ctrl+6 "does nothing" check keeps a 500 ms window, marked `NOSONAR`: the app calls `preventDefault()` for every Ctrl+digit, so there's no event to wait for.
- Smaller smells: `async` without `await` in three page-object methods, `String.raw` in the radio filter, flatter `clearAllEntries`.

Left as is: two "`await` inside a loop" smells in `states.visual.ts` (the drip counter taps have to be sequential).

Gates: `pnpm verify:strict` green (168 unit, 117 e2e, 72 visual); e2e against `pnpm dev` green (116, PWA test excluded).

## 2026-10-25 — Story 05: Checkpoint safety net (phase 0 done)

**Approved by the human:** "Safety net approved", after the requested screenshot states were added (checkpoint feedback above), the SonarCloud findings were fixed and the CodeRabbit comments were answered.

**Merged:** PR #186 squash-merged into `main` as `06879bc` (`fix: add test hooks for migration safety net (migration phase 0)`); semantic-release cut `0.32.92` (`db5aa3b`), deployed to production. The human confirmed all checks of the runbook: CI on `main`, the release deploy, the Test workflow against production, and `pnpm migration:status` / `pnpm verify:strict` on `main`.

From here on, a green `pnpm verify` / `pnpm verify:strict` means "nothing broke". Next: phase 1 (`migration/1-decouple`, stories 06–11, checkpoint 12).

## 2026-10-25 — Story 06: Persisted state with runed (Done)

Branch `migration/1-decouple` created from `main` (`6359bf0`). `settings` and `sync` now use runed `PersistedState` (`settings.svelte.ts`, `sync.svelte.ts`), created in `AppLayout` and read through `getSettingsStore()` / `getSyncStore()` / `getSyncAvailabilityStore()`. The sync service gets the store passed in (`sync(syncStore)`, `initScheduledSync(syncStore)`).

**Decisions:**

- The stores use getters instead of `$derived` fields. `PersistedState` already reads storage on every access, and a cache could go stale for the timer-driven sync.
- The setters run fully inside `untrack`. Spreading the `PersistedState` proxy inside an `$effect` (Appearance, Units) otherwise loops with `effect_update_depth_exceeded`. A regression unit test covers this.
- Vitest uses `resolve.conditions: ['browser']`.

**Behaviour difference:** default values are now written to storage when the key is missing. The format is unchanged.

**Status:** `local-storage-store` 0. The other phase 1 categories are unchanged: `skeleton-v2-imports-outside-ui` 29, `app-shell` 1, `conic-gradient` 1, `scss` 3, `skeleton-apply-in-app-css` 9.

**Gates:** `pnpm verify:strict` green: 181 unit, 120 e2e (3 new: settings fallback ×2, dark class before hydration), 72 visual.

## 2026-10-25 — Story 07: Own app layout (Done)

`AppShell` is replaced by a CSS grid in `AppLayout.svelte`: a header across both columns, an `aside` with the rail (`nav hidden md:block`), and `<main id="page">` as the only scroll container (`scrollbar-gutter: stable`, `outline-offset-[-3px]`, `handlePageScroll`). `Spinner` is a plain `div` with a `currentColor` conic gradient. PageActions passes `class="text-white"`.

**Status:** `app-shell` 0, `conic-gradient` 0. Remaining phase 1 categories: `skeleton-v2-imports-outside-ui` 29, `scss` 3, `skeleton-apply-in-app-css` 9.

**Gates:** `pnpm verify:strict` green (181 unit, 120 e2e, 72 visual). The screenshots matched the v2 baseline on the first run. Tab order checked on desktop (header → rail → page).

## 2026-10-25 — Story 08: Overlay services and hosts (Done)

Modals, toasts and the drawer now go through `modal`, `toast` and `drawer` in `src/lib/services/ui/`. These are runes singletons with no Skeleton or store imports. `ModalHost`, `ToastHost` and `DrawerHost` in `src/lib/components/shared/ui/` translate them to the v2 stores. `Popover` wraps the v2 `popup` action (as a Svelte attachment on the trigger snippet) and replaces `use:popup` in Method, CoffeeType and PageSearch. `ToastHelper`, `ModalHelper`, `autocomplete.ts` and `EnableGlobalMessages` are deleted.

**Decisions:**

- The toast service owns the timeouts.
- `modal.open` infers its result type from the component's `close` prop.
- The dangerous modal footer uses v2's `buttonNeutral`/`buttonPositive` props instead of CSS.
- The hosts read the v2 stores untracked, so a close done by v2 itself (backdrop, Escape) can't reopen the overlay. The first e2e run caught exactly that for the drawer.

**Status:** `skeleton-v2-imports-outside-ui` 15 (from 29). `skeleton-apply-in-app-css` 5 (from 9; the modal footer rules are gone). `scss` 3 is unchanged and belongs to story 11.

**Gates:** `pnpm verify:strict` green: 194 unit (13 new service tests), 120 e2e, 72 visual.

## 2026-10-25 — Story 09: Form control wrappers (Done)

New wrappers `Switch`, `SegmentedControl`, `Slider`, `RatingGroup`, `TagsInput` and `FileUpload` in `src/lib/components/shared/ui/` replace the v2 form controls at all nine call sites. `TagsInput` owns the tag colours and the Escape handling. `Aromas.svelte` no longer touches Skeleton's DOM, and `installEventHandler` is deleted.

**Decision:** `label` exists only where a call site passes one (`Switch`), so the a11y tree stays the same.

**Status:** `skeleton-v2-imports-outside-ui` 7, `skeleton-apply-in-app-css` 5.

**Gates:** `pnpm verify:strict` green (194 unit, 120 e2e, 72 visual).

## 2026-10-25 — Story 10: List and navigation wrappers (Done)

`Combobox`, `Listbox`, `Pagination`, `NavRail` and `AppBar` in `src/lib/components/shared/ui/` replace the last v2 components outside `ui/`. These were Method/CoffeeType autocompletes, the sort popups and paginators of Journal and MyCoffees, the rail and the app bar. `brewMethods.ts` uses `ComboboxOption<string>`. The `.autocomplete-button` and `.app-rail-anchor` overrides became utility classes inside the wrappers.

**Status:** `skeleton-v2-imports-outside-ui` 0; no `@skeletonlabs/skeleton` import outside `src/lib/{components,services}/ui/`. Remaining phase 1 categories: `scss` 3, `skeleton-apply-in-app-css` 5 (story 11).

**Gates:** `pnpm verify:strict` green: 194 unit, 121 e2e (new: Combobox Escape keeps focus in the input), 72 visual.

## 2026-10-26 — Story 11: Stylesheet preparation (Done)

`src/app.scss` is now plain `src/app.css`. It keeps only the Tailwind directives, `:root`, the tap highlight, the heading/link/button weight, the mesh background, the `html, body` sizing and the view transitions. Every override and token moved into its owner as classes, wrapper props or plain host CSS (details in the story's "As built"). `PageTitle.svelte` is new. `AppDragHandle` uses plain CSS, `sass` is removed, and the `body` background rule was deleted with no pixel change.

**Status:** `pnpm migration:status --phase 1` exits 0, so every phase 1 category is 0. Phase 4 (`sveltekit-2`) is the only category with large counts left.

**Build size:** CSS 129,452 → 122,398 bytes; client output 6,832 → 6,828 KB.

**Gates:** `pnpm verify:strict` green (194 unit, 121 e2e, 72 visual).

**PR:** draft [#188](https://github.com/Robin-w151/coffee-pal/pull/188) `migration/1-decouple → main`, titled `fix: decouple app from Skeleton v2 (migration phase 1)`, opened at the human's request. Next is checkpoint 12 (human): review, merge and the production data check.

## 2026-10-26 — Checkpoint 12: SonarCloud findings on PR #188

The quality gate failed on reliability (C) because of one bug. Fixed:

- `sync.ts`: the scheduled-sync closure marks `sync(...)` as `void` (S9383). It is fire and forget, like before, and `sync()` reports its own failures as toasts.
- `settings.svelte.ts`: the sanitising `catch` has no unused binding and a comment saying that invalid JSON resets to the defaults (S2486).

Left on purpose: `type ToastId = number` (S6564) stays, with `NOSONAR` and a reason. Skeleton v4's toaster uses string ids, so phase 2 changes only that line.

Gates: `pnpm verify:strict` green (194 unit, 121 e2e, 72 visual).

## 2026-10-27 — Checkpoint 12: review feedback on PR #188

Applied:

- Exact versions for `jsdom` and `runed`.
- UUID ids for modals and toasts.
- `const` for `$derived`.
- Combobox `value` prop.
- The unused Popover `open` prop is removed.
- `registeredSyncStore` replaces `scheduledSyncStore` as the name of the store the scheduled sync uses.
- Two `TagsInput` fixes:
  - A new, unsaved entry had uncoloured tags.
  - New tags faded in from the theme colour.
- **The wrapper folder moved:** `src/lib/components/ui/` → `src/lib/components/shared/ui/`. The `migration-status` UI-layer glob and the paths in all stories moved with it. `src/lib/services/ui/` stays where it is. Later stories therefore refer to `shared/ui/`.
- **Regression from story 11, fixed:** the unit selects in measurement inputs had lost their 6rem minimum width (71/86 px instead of 96 px). Skeleton's own `!important` rule on `.input-group select` is more specific than a single utility class. The minimum widths are now arbitrary variants on the input group (`[&_select]:!min-w-[6rem]` etc.), which restores the old specificity. The visual gate missed this because the change stays under its 1% pixel threshold, so a new e2e test pins the select widths.

Gates: `pnpm verify:strict` green (see the commit).

## 2026-10-27 — Story 12: Merge phase 1 (Done, phase 1 complete)

PR #188 was squash-merged into `main` as `ed2b27a`, and semantic-release cut `0.32.93` (`67f9a69`), deployed to production. The human confirmed all runbook checks: the preview, CI and the Test workflow, the app update on the phone, settings and sync connection unchanged, and a successful sync.

The app now runs on Skeleton v2 only behind `src/lib/components/shared/ui/` and `src/lib/services/ui/`. Next is phase 2: `migration/2-skeleton-v4` is branched from `main` (phase 1 is merged, so no stacking or rebase is needed). It covers stories 13–17, up to checkpoint 18.

## 2026-10-27 — Story 13: Tailwind v4 and Skeleton codemods (Done)

Phase 2 starts on `migration/2-skeleton-v4`, branched from `main` (phase 1 is merged, so nothing is stacked). Tailwind 4.3.3 runs through `@tailwindcss/vite`. `@skeletonlabs/skeleton` and `@skeletonlabs/skeleton-svelte` are pinned to 4.15.2, with the cerberus preset until story 14. Following the archived v2 → v4 guide, Tailwind came first, then the codemods. Both used Skeleton CLI 5.0.1 on `src/` only, each in its own commit. The two codemod commits skip the hooks (approved by the human), because the dropped v2 imports fail ESLint until the placeholders land. Details are in the story's "As built".

**Status:** `tailwind-v3` 1 (`theme.ts`, story 14), `skeleton-v2-imports-total` 0, `v2-classes` 11 (input groups in 3 files, story 17), `migration-placeholders` 15.

**Gates:** `check`, `lint`, `build` and `test:unit` (194) green. E2e: 110 passed, 14 failed. Visual: not run, since it's a judgment check in phase 2.

**Failing e2e tests (the to-do list for 14–17):**

- `SegmentedControl` (story 15), 8 tests: `settings.spec` appearence system/light/dark, units metric/imperial, and "appearence radio group marks one option". `appShell.spec` phone: settings with an unknown colour scheme / invalid JSON fall back to the defaults. All of them read the checked option through the v2 markup.
- `FileUpload` (story 15), 1 test: `settings.spec` backup import "imports journal and coffee entries". The native file input's accessible name contains "import", so `getByRole('button', { name: 'Import' })` matches two elements.
- `Combobox` (story 16), 1 test: `journal.spec` "brew method autocomplete selects with arrow down and enter". There's no keyboard navigation yet.
- `Listbox` (story 16), 1 test: `journal.spec` "sort list box selects with the keyboard".
- `Pagination` (story 16), 1 test: `journal.spec` "paginator". The buttons are named "First"/"Last", not "First page"/….
- `ModalHost` (story 16), 1 test: `appShell.spec` phone "modal traps focus".
- `ToastHost` (story 16), 1 test: `appShell.spec` phone "toast after deleting an entry can be dismissed". The dismiss button is named "Dismiss", not "Dismiss toast".

Everything else passes, including persistence, legacy data, scroll restoration, view transitions, drawer navigation and the other overlay tests.

## 2026-10-27 — Story 14: Coffee theme for Skeleton v4 (Done)

`src/themes/coffee.css` replaces `theme.ts` and the cerberus preset. `<html data-theme="coffee">` is set, and the mesh background is now on `body`. Two new e2e tests pin the v2 palette (all seven 500 shades) and the mesh in light and dark.

**Status:** `tailwind-v3` 0. Remaining phase 2 categories: `v2-classes` 11 and `migration-placeholders` 15.

**Gates:** `check`, `lint`, `build` and `test:unit` (194) green. E2e: 113 passed and the same 14 failures as story 13; the list didn't grow. A11y: no new violations.

**Visual review (72 diffs against the v2 baseline, all expected):** the hues match on every screen in both schemes. That covers the teal primary (active rail and menu item, FAB, focus ring), the brown secondary/tertiary (icon buttons, ratio badges, suggestion chips, rating stars), the red error, the mesh and the navy dark surfaces. Per screen:

- **All screens:** page titles are larger (v4 heading scale), and headings and labels are lighter. Wrapped controls show their placeholders (radios, checkbox, range, plain pagination buttons, unstyled rail, app bar without its own background).
- **Lists (journal, my coffees):** `card` has no surface background in v4, so the list floats on the mesh (story 16/17). The empty-list hint has the same issue.
- **Forms (journal/coffee new and entry):** plain inputs take v4's `.input` look. Input groups (`MeasurementInput`, `UrlInput`, Estimation) are white native fields, which stand out in dark mode (story 17, input groups → `ig-*`). Error inputs lose v2's red tint (`input-error` has no v4 equivalent; story 17).
- **Calculator, drip counter:** chips and the tap/reset buttons keep their colours. The input groups behave as in the forms.
- **Settings:** the segmented controls are native radios, and the file upload is a native input (story 15).
- **Overlays:** the confirm modal and the suggestion lists keep their position and colours. The app menu drawer is a plain list (story 16), and the toast uses the placeholder markup.

## 2026-10-28 — Story 15: Form control wrappers on v4 (Done)

`Switch`, `SegmentedControl`, `Slider`, `RatingGroup`, `TagsInput` and `FileUpload` are built on `@skeletonlabs/skeleton-svelte` 4.15.2, one commit each. Their props are unchanged and no call site changed. Details are in the story's "As built".

**Decision (human, 2026-10-28):** tests coupled to v2 markup may have their page objects and interaction lines adapted; assertions stay unchanged (see the epic's Assumptions). Changes in this story:

- `settings.page.ts`: `getCheckedRadio` returns the label around the checked radio.
- `calculator.page.ts`: `iceRatioRange` is the hidden form input; there's a new `iceRatioThumb` and a new `setIceRatio()`. `calculator.spec.ts` uses them for the slider interactions, and `states.visual.ts` waits for the thumb.
- `journalEntryDetail.page.ts` and `myCoffeesEntryDetail.page.ts`: `getRatingStar` uses role `radio`.
- `myCoffeesEntryDetail.page.ts`: `addAroma` waits for the cleared input. `myCoffees.spec.ts`: the fade-in recorder selects `button`, and the Escape test waits a frame before blurring.

**Status:** `migration-placeholders` 9, `v2-classes` 11.

**Gates:** `check`, `lint`, `build` and `test:unit` (194) green. E2e: 121 passed, 6 failed (was 14). A11y: no new violations.

**Failing e2e tests (to-do list for 16):**

- `Combobox`, 1 test: `journal.spec` "brew method autocomplete selects with arrow down and enter".
- `Listbox`, 1 test: `journal.spec` "sort list box selects with the keyboard".
- `Pagination`, 2 tests: `journal.spec` "paginator", and `settings.spec` backup import "imports journal and coffee entries" (it now gets past the upload and needs "Last page").
- `ModalHost`, 1 test: `appShell.spec` phone "modal traps focus".
- `ToastHost`, 1 test: `appShell.spec` phone "toast after deleting an entry can be dismissed".

## 2026-10-28 — Story 16: Overlays, lists and navigation on v4 (Done)

`AppBar`, `NavRail`, `Pagination`, `Listbox`, `Popover`, `Combobox`, `ModalHost`, `DrawerHost` and `ToastHost` are built on `@skeletonlabs/skeleton-svelte` 4.15.2. Service APIs and wrapper props are unchanged, and `@floating-ui/dom` is removed. Details are in the story's "As built".

**Notable:** Zag sets up Escape and outside-click handling for an overlay only after it has opened, and input that arrives earlier is lost. The modal, drawer and popover therefore close on Escape, backdrop and outside clicks themselves. After that, the overlay specs were stable over 3 repetitions under load. Also, 4.15.2's pagination first/last triggers lack their data attributes and disabled state; the wrapper sets both.

**Test change (phase 2 rule):** `journal.page.ts` has a new `selectSortOptionWithKeyboard` (type-ahead + Enter), used by "sort list box selects with the keyboard".

**Status:** `migration-placeholders` 0. `v2-classes` 11 (input groups, story 17).

**Gates:** `pnpm verify` green: 194 unit, 127 e2e, 0 failing (the failing-test list is empty). A11y: no new violations.

**Visual review (72 diffs against the v2 baseline):** the hues match everywhere. The rail, app bar, pagination, sort popup, combobox list, confirm dialog, drawer and toast show the v4 look and work in both schemes. Remaining differences belong to story 17:

- **Input groups (priority):** in dark mode the v2 `input-group` fields (`MeasurementInput`, `UrlInput`, Estimation's drip rate) are white with white text, so their values are unreadable. The drip rate's "dpm" addon is also misaligned.
- `card` has no surface background in v4: the lists and the calculator/drip-counter sections float on the mesh.
- Error inputs have no red tint (`input-error`), and the Temperature Converter fields look like plain text in light mode.

Next is story 17 (cleanup, input groups, PR).

## 2026-10-28 — Story 17: Skeleton v4 cleanup (implementation done, PR pending)

Input groups are on `ig-*`, and the leftover v2 classes are replaced (`divider-vertical`, `list-nav`, `list-dl`, plus an app-level `input-error`). Cards have a surface again. The a11y baseline for Settings is shrunk, and `pnpm visual:review` builds the review page. Details are in the story's "As built".

**Status:** `pnpm migration:status --phase 2` exits 0. `skeleton-v4-only` 12 is the `ig-*` classes, which story 19 renames.

**Gates:** `pnpm verify` green: 194 unit, 127 e2e. A11y: no new violations, and Settings is down from 6 violations to 0 per scheme. Visual: 71 of 72 screens differ from the v2 baseline (`journal-list-empty-dark` stays within the threshold). The baseline isn't updated before checkpoint 18.

**Visual review (every diff, light and dark, phone and desktop):**

| Screen                                                                        | Verdict                                                                                                                                     |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| calculator, calculator-sections                                               | OK – intended: v4 inputs and input groups, Skeleton switch and slider (smaller "Ice Ratio" label), vertical dividers kept, larger headings. |
| drip-counter (outside/within target)                                          | OK – intended: same tap/reset colours, badges in the theme colours, "dpm" cell aligned in the input group.                                  |
| journal-list, my-coffees-list (phone list, desktop table), journal-list-empty | OK – intended: card surface again, v4 pagination (page numbers instead of "1-3 of 3"), tonal ratio badges.                                  |
| journal-search-active                                                         | OK – intended: the search header card keeps its surface, and the clear button is in the error colour.                                       |
| journal-entry, journal-new, my-coffees-entry, my-coffees-new                  | OK – intended: v4 inputs (thin outline instead of v2's filled fields), Skeleton stars, aroma tags as coloured delete buttons.               |
| coffee-validation-errors, journal-entry-validation-errors                     | OK – fixed in this story: the error ring and tint come back through the app-level `input-error`.                                            |
| brew-method-suggestions (open/filtered), coffee-type-suggestions-open         | OK – intended: v4 combobox list in the surface colour, positioned under the input.                                                          |
| sort-popup-open                                                               | OK – intended: v4 listbox in the popover, check icon on the selected option.                                                                |
| dangerous-confirm-modal-open                                                  | OK – intended: v4 dialog, Cancel tonal and Confirm in the error colour, dimmed backdrop.                                                    |
| app-menu-open                                                                 | OK – fixed in this story: menu links have padding, rounding and hover again (replacing `list-nav`).                                         |
| toast-visible                                                                 | OK – intended: v4 toast at the bottom centre in the surface colour (v2: primary), clear of the menu button.                                 |
| settings                                                                      | OK – intended: v4 segmented controls, file upload dropzone, switch.                                                                         |

**Known difference for checkpoint 18:** in dark mode, field outlines (`surface-800`) are faint on cards (`surface-950`), because the coffee theme's darkest shades are close together. It needs a design decision (theme shades or a dark ring colour for fields).

**Next:** step 4 of story 17, updating the PR and marking it ready. Waiting for the human's go-ahead; no PR exists for phase 2 yet.
