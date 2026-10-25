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
