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
- `pnpm` isn't on `PATH` on the dev machine (it runs through `corepack pnpm`, like `.husky/pre-commit`), so `verify` and the Playwright `webServer` call `corepack pnpm …` instead of `pnpm …`.
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
