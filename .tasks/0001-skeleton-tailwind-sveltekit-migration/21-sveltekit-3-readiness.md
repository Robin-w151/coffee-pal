# 21: SvelteKit 3 readiness check

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Todo
**Depends on:** 20
**Size:** S — research and a short report, plus deprecation fixes on 2.x; the outcome may be "wait".

## User story

As the project owner, I want to know whether all tools the app depends on support SvelteKit 3, so that we don't start a migration that can't be finished.

Branch: `migration/4-sveltekit-3` from `main`.

## Description

1. **Compatibility matrix.** For each package, find the latest version and its peer ranges for `@sveltejs/kit`, `svelte`, `vite` and `typescript` (`pnpm view <pkg> peerDependencies`, changelogs, GitHub issues), then choose the **highest** version of `@sveltejs/kit` (3.x), `svelte` and `vite` (8.x) that every package accepts. **TypeScript is fixed at the latest 6.x** (decision 2026-10-25: 7.x, npm's `latest` as of 2026-10-25, doesn't work with the toolchain yet); check that every package accepts it. Include `svelte`, `vite` and `typescript` themselves in the list:
   `@sveltejs/kit`, `svelte`, `vite`, `typescript`, `@sveltejs/vite-plugin-svelte`, `@sveltejs/adapter-auto`, `svelte-adapter-bun`, `@vite-pwa/sveltekit`, `vite-plugin-pwa`, `vitest`, `@vitest/coverage-v8`, `svelte-check`, `eslint-plugin-svelte`, `typescript-eslint`, `prettier-plugin-svelte`, `@tailwindcss/vite`, `@skeletonlabs/skeleton-svelte`, `runed`, `@playwright/test`.
   Write the matrix into PROGRESS.md (package, current, target, compatible yes/no/unclear, source link).
2. **Read the [SvelteKit 3 migration guide](https://svelte.dev/docs/kit/migrating-to-sveltekit-3)** and list every breaking change that applies to this repo, with the files affected. Known so far (verify each against the guide): `svelte.config.js` removed (adapter switch, `$assets`/`$lib` aliases, `onwarn`, `vitePlugin.inspector` move to the Vite plugin); `$lib` → `#lib` with explicit file paths (~201 extensionless imports); service worker: the app doesn't use `$service-worker` (Workbox + `self.__WB_MANIFEST` in [src/service-worker.ts](../../src/service-worker.ts)), so check only that `@vite-pwa/sveltekit` still injects the manifest; navigation: check whether `goto(…, { replaceState: true })` (3 files: [JournalEntryDetail.svelte](../../src/lib/components/journal/JournalEntryDetail.svelte), [CoffeeEntryDetail.svelte](../../src/lib/components/myCoffees/CoffeeEntryDetail.svelte), [Calculator.svelte](../../src/lib/components/calculator/Calculator.svelte)) is still supported or must become `{ shallow: true }`/`replaceState()`; errors: no `src/hooks*` files, so only the default `handleError` behaviour applies; Node ≥ 22.17 (repo uses 24.x, OK).
3. **Prepare on 2.x** (low-risk, same branch): update `@sveltejs/kit` to the latest 2.x, fix all deprecation warnings, and replace `$app/stores` with `$app/state` in the 5 files that use it (`grep -rlF '$app/stores' src`). Gate: `pnpm verify:strict`.
4. **Go/no-go:**
   - All required packages compatible → mark Done, continue with 22.
   - Any package blocking (most likely `@vite-pwa/sveltekit` or `svelte-adapter-bun`) → **stop rule**: write the blocker and the issue link in PROGRESS.md and the epic's open questions, and tell the human. Story 22 waits. The 2.x preparation commits can still be merged via a small PR.

## Acceptance criteria

- [ ] PROGRESS.md contains the compatibility matrix and the list of breaking changes with affected files.
- [ ] PROGRESS.md names the chosen target versions for `@sveltejs/kit`, `svelte` and `vite`, with the peer range that limits each, and confirms every package accepts TypeScript 6.x (any package that requires 7.x is a blocker).
- [ ] `$app/stores` usage = 0; no SvelteKit deprecation warnings in `pnpm dev`/`pnpm build` output.
- [ ] `pnpm verify:strict` green on latest SvelteKit 2.x.
- [ ] A clear go/no-go is recorded.

## Technical notes

- `svelte-adapter-bun` is used for the Docker image ([d.build.Dockerfile](../../d.build.Dockerfile), `USE_ADAPTER_BUN=true`). If it blocks, an alternative is `@sveltejs/adapter-node` run with Bun; propose it but let the human decide.

## Testing

- `pnpm verify:strict`.

## Out of scope

- The SvelteKit 3 upgrade itself (22).
