# 22: SvelteKit 3 migration

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 21
**Size:** L — a cross-cutting change (config, every `$lib` import, service worker, toolchain bumps to Vite 8 and TypeScript 6) on a freshly released major, with the PWA as the main risk.

## Decisions (2026-11-04)

Story 21's no-go is resolved by the human:

- **Adapter for the Docker image:** first the official `@sveltejs/adapter-bun`; it was dropped the same day (see below) for `@sveltejs/adapter-node`, and Bun is removed from the image.
- **PWA plugin:** `@vite-pwa/sveltekit` 2.0.0 is ready to use. Its v2 API (`withPwa`, `buildSW`, `@vite-pwa/workbox-swkit`) is listed in [PROGRESS.md](PROGRESS.md).

## Docker: from Bun to Node (2026-11-04)

The official `@sveltejs/adapter-bun` only builds under Bun, and `@vite-pwa/sveltekit` 2.0.0 uses `findPackageJSON` from `node:module`, which Bun 1.4.4 lacks, so the image couldn't build. The human decided: `@sveltejs/adapter-node` (switch `USE_ADAPTER_NODE=true`), and [d.build.Dockerfile](../../d.build.Dockerfile) builds with pnpm and runs `node build` on `node:24-slim`. `adapter-static` was considered and rejected: the four routes with no prerendering would need an SPA fallback, and unknown URLs would lose their 404 status.

## User story

As the project owner, I want the app on SvelteKit 3, so that it stays on the supported major version.

## Description

Continue on `migration/4-sveltekit-3`.

1. `pnpm dlx sv migrate sveltekit-3` → review → commit. Check the TODO list it prints and copy it into PROGRESS.md.
2. **Toolchain:** bump `vite`, `svelte` and the other packages to the targets chosen in the story 21 matrix, and `typescript` to the latest 6.x (not 7.x; decision 2026-10-25). One commit for the bumps, then fix type errors.
3. **Config:** move [svelte.config.js](../../svelte.config.js) into `sveltekit({...})` in [vite.config.ts](../../vite.config.ts): adapter switch (`USE_ADAPTER_BUN`), aliases (`$assets` is used by `Calculator.svelte` and `Ratios.svelte` for `presets.json` (story 21); give it a `#assets` entry in `imports` or use relative imports. `$lib` → `#lib` is step 4), `onwarn` (ignore `state_referenced_locally`), `vitePlugin.inspector`, `vitePreprocess`. Delete `svelte.config.js`. Then fix the two known dependents: [eslint.config.js](../../eslint.config.js) imports `./svelte.config.js` for `eslint-plugin-svelte`; pass the equivalent options (or none, if the plugin no longer needs them with SvelteKit 3) instead. [vitest.config.ts](../../vitest.config.ts) gets its own `sveltekit()` in story 06; make it reuse the Vite config (`mergeConfig(viteConfig, defineConfig({ test: … }))`, or move the `test` block into `vite.config.ts`) so the inlined kit options apply to tests too. Check `prettier-plugin-svelte` the same way.
4. **Imports:** `$lib/...` → `#lib/...` with explicit file paths (`#lib/utils/index.ts` instead of `$lib/utils`); `package.json` gets the `imports` field the guide prescribes. The codemod should do this; fix the rest. Update [tsconfig.json](../../tsconfig.json) if needed.
5. **Service worker:** [src/service-worker.ts](../../src/service-worker.ts) uses no SvelteKit modules; only check that `@vite-pwa/sveltekit` with `injectManifest` still injects `self.__WB_MANIFEST`. Gates: the PWA e2e test (story 02) and the generated `service-worker.js` with its precache list in the build output.
6. **Errors:** there are no `src/hooks*` files; check that the default error page still renders for an unknown route (e.g. `/does-not-exist`) and an unknown entry id.
7. **Docker:** `docker build -f d.build.Dockerfile .` still works (adapter-node since 2026-11-04, see above), if Docker is available locally; otherwise note it for the human in story 23.
8. Gates: `pnpm migration:status --phase 4` exits 0; `pnpm verify:strict` green, 3 consecutive runs; no new a11y violations. Push, set the PR title to `chore(deps): upgrade to SvelteKit 3 (migration phase 4)` (releases a patch via the existing `chore(deps)` rule; see "Releases and deploys" in the epic), and mark the PR ready.

## Acceptance criteria

- [x] `@sveltejs/kit` is on the latest 3.x; `svelte.config.js` deleted; `pnpm migration:status --phase 4` exits 0.
- [x] `pnpm verify:strict` green (screenshots identical to the v5 baseline within the threshold: this phase must not change the look).
- [x] The PWA e2e test (service worker active, offline reload) is green against the local preview.
- [x] `USE_ADAPTER_NODE=true pnpm build` succeeds, and so does `docker build -f d.build.Dockerfile .` (adapter changed from Bun to Node on 2026-11-04).
- [x] `grep -rn "svelte\.config\." . --include=*.js --include=*.ts --exclude-dir=node_modules` returns nothing except the check in `scripts/migration-status.js` that the file is gone (the pattern was `svelte.config`, which also matches eslint-plugin-svelte's `svelte.configs`); `pnpm lint` and `pnpm test:unit` are green.
- [x] PR ready with a summary and the codemod TODO list resolved.

## Technical notes

- Guide: https://svelte.dev/docs/kit/migrating-to-sveltekit-3
- Stop rule: if the PWA plugin breaks in a way that needs a different PWA strategy (e.g. `generateSW`), ask the human first.

## Testing

- Gates above; also `pnpm dev` once to check HMR and the inspector still work.

## Out of scope

- Using new SvelteKit 3 features (env in `src/env.ts`, remote functions); possible follow-up epic.
