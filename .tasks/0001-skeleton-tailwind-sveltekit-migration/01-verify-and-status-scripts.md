# 01: Verify and migration-status scripts

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** –
**Size:** S — two small scripts and a Playwright config tweak, following existing patterns; the only open detail is current svelte-check warnings.

## User story

As Claude working autonomously on this epic, I want one command that says "everything still works" and one that says "how much of the old stack is left", so that I can check every step without the human.

Unblocks every other Claude story. Branch: `migration/0-safety-net` (create from `main`).

## Description

1. **`pnpm verify`** runs, in order and stopping at the first failure: the strict type check, `pnpm lint`, `pnpm build`, `pnpm test:unit`, then the Playwright e2e suite against a **local production preview** (not the dev server, so the service worker and production bundling are exercised).
   - In [playwright.config.ts](../../playwright.config.ts): `const useLocalPreview = process.env['TEST_LOCAL_PREVIEW'] === '1';`. When true, set `baseURL` to `http://localhost:4173` and add `webServer: { command: 'pnpm exec vite preview --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: false }`, regardless of `TEST_BASE_URL`. That variable is set by `.env.local` (`localhost:5173`) on the dev machine and by the Test workflow (remote URL) in CI; dotenv-flow refills it if it's merely unset, so an explicit flag is needed. When false, the config behaves exactly as today.
   - In local preview mode, set the reporter to `[['html', { open: 'never' }], ['list']]`, so a failing run exits non-zero instead of serving the report and waiting. The human opens it with `pnpm exec playwright show-report`.
   - New script `test:e2e:local`: `TEST_LOCAL_PREVIEW=1 playwright test`.
   - New script `check:strict`: `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --fail-on-warnings`. `pnpm check` (used by CI) stays as it is.
   - `verify` script in `package.json`: `pnpm check:strict && pnpm lint && pnpm build && pnpm test:unit && pnpm test:e2e:local`.
   - If svelte-check reports warnings today: fix them in this story if trivial (≤ ~10). Otherwise `verify` temporarily uses `pnpm check`, the warning count goes into PROGRESS.md, and story 11 switches it to `check:strict`.
2. **`pnpm migration:status`** (`scripts/migration-status.js`, plain Node ESM like the other scripts in [scripts/](../../scripts)). It counts what's left of the old stack and prints a table; `--json` prints JSON; `--phase <N>` exits with code 1 if any category whose target phase is ≤ N is non-zero.

   | Category                         | What is counted                                                                                                                                                             | Must be 0 after phase |
   | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
   | `skeleton-v2-imports-outside-ui` | files importing `@skeletonlabs/skeleton` outside `src/lib/components/ui/` and `src/lib/services/ui/`                                                                        | 1                     |
   | `local-storage-store`            | uses of `localStorageStore`                                                                                                                                                 | 1                     |
   | `app-shell`                      | uses of `AppShell`                                                                                                                                                          | 1                     |
   | `conic-gradient`                 | uses of `ConicGradient`                                                                                                                                                     | 1                     |
   | `scss`                           | `*.scss` files in `src/` + `lang="scss"` blocks + `sass` in package.json                                                                                                    | 1                     |
   | `skeleton-apply-in-app-css`      | `@apply` of `variant-*`, `*-token`, `btn`, `card`, `chip`, `badge`, `input*` in `src/app.(s)css`                                                                            | 1                     |
   | `tailwind-v3`                    | `tailwind.config.*`, `postcss.config.*`, `@tailwind ` directives, `@skeletonlabs/tw-plugin` / `@tailwindcss/container-queries` / `autoprefixer` in package.json, `theme.ts` | 2                     |
   | `skeleton-v2-imports-total`      | all files importing from the v2 package entry `@skeletonlabs/skeleton` _as a JS module_ (not the CSS import used by v4+)                                                    | 2                     |
   | `v2-classes`                     | `variant-*`, `*-token`, `input-group*` class usages in `src/`                                                                                                               | 2                     |
   | `migration-placeholders`         | occurrences of `MIGRATION_PLACEHOLDER`                                                                                                                                      | 2                     |
   | `skeleton-v4-only`               | `ig-` classes, `card-hover`, `btn-icon-fab`, `@variant theme-`                                                                                                              | 3                     |
   | `sveltekit-2`                    | `svelte.config.js` exists, imports from `$app/stores`, `$lib/` imports                                                                                                      | 4                     |

   Keep the category definitions in one array at the top of the script (name, glob, regex, target phase), so later stories can tweak them. Use only Node built-ins (`fs.globSync` is available in Node 24) and `git ls-files` to respect `.gitignore`.

3. **`PROGRESS.md`** in this epic folder: create it with a short header explaining its purpose and the first entry (date, story 01, the initial status table, the verify result).
4. **CI for stacked phase PRs:** in [ci.yaml](../../.github/workflows/ci.yaml), add `'migration/**'` to `on.pull_request.branches` (next to `main`), so the phase 2 PR, which targets `migration/1-decouple` until story 12 is merged, still gets `lint`/`check`/`test:unit`. The `release` job keeps running only on `push` to `main`.

## Acceptance criteria

- [x] Given a clean checkout with no server running, when I run `pnpm verify`, then it builds, starts `vite preview` on port 4173, runs all e2e specs against it, and exits 0.
- [x] Given `.env.local` sets `TEST_BASE_URL=http://localhost:5173`, when I run `pnpm test:e2e:local`, then the tests still run against `http://localhost:4173`.
- [x] Given `TEST_BASE_URL=https://coffee-pal.vercel.app`, when I run `pnpm test:e2e`, then no local server is started and the tests run against that URL (Test workflow behaviour unchanged).
- [x] Given any failing step, when `pnpm verify` runs, then it stops there and exits non-zero.
- [x] Given a failing e2e test, when `pnpm verify` runs, then it exits non-zero within the normal test time and doesn't open a browser or report server.
- [x] `pnpm migration:status` prints every category in the table above; as of 2026-10-24 it reports `local-storage-store` = 2, `scss` = 3, `conic-gradient` = 1, `skeleton-v2-imports-total` = 31 (small drift is fine if `main` changed).
- [x] `pnpm migration:status --phase 1` exits 1 today; `--json` output is valid JSON with `{ category, count, targetPhase, files[] }` entries.
- [x] `PROGRESS.md` exists with the first entry.
- [x] `pnpm lint` passes with the new script.
- [x] `ci.yaml` triggers on pull requests to `main` and `migration/**`; the `release` job condition (`push` only) is unchanged.

## Technical notes

- Files: [package.json](../../package.json), [playwright.config.ts](../../playwright.config.ts), `scripts/migration-status.js` (new), [.github/workflows/ci.yaml](../../.github/workflows/ci.yaml), `.tasks/0001-skeleton-tailwind-sveltekit-migration/PROGRESS.md` (new).
- ESLint already allows Node globals ([eslint.config.js](../../eslint.config.js)); no change expected. `playwright-report/` and `test-results/` are gitignored, which Prettier 3 respects, so `pnpm lint` doesn't touch them.
- `vite preview` serves the output of `vite build`. `verify` already builds before e2e, so `webServer` must not build again.
- [vite.config.ts](../../vite.config.ts) calls `git rev-parse` in `getCommitHash()`; that's fine locally.
- **As built (2026-10-25):** `pnpm` isn't on `PATH` on the dev machine (it runs as `corepack pnpm`, like `.husky/pre-commit`), so `verify` and the Playwright `webServer` use `corepack pnpm …`. The 11 existing svelte-check warnings (`state_referenced_locally`) were fixed with `untrack(() => …)`, so `verify` uses `check:strict` from the start. `migration-status.js` counts either matching files (`unit: 'files'`) or occurrences per category; `files[]` always lists the files with a hit.

## Testing

- Run `pnpm verify` twice in a row and record the duration in PROGRESS.md. The second run must start its own server (no leftover process on 4173); a reused server could serve the previous build's server code and give a false green.
- Manually break a unit test to confirm `verify` fails, then revert.

## Out of scope

- New e2e tests (02, 03), visual and a11y tests (04, which adds `verify:strict`).
