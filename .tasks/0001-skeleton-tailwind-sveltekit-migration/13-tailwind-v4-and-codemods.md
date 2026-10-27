# 13: Tailwind v4 and Skeleton codemods

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 11
**Size:** L — three tools (Tailwind upgrade, `skeleton-3` and `skeleton-4` codemods) run in sequence, the app breaks on purpose, and their output on the wrapped code is uncertain.

## User story

As Claude, I want Tailwind v4 and Skeleton v4 installed with the automated codemods applied and the app building again, so that the remaining work is a measurable list of failing tests and placeholders.

Branch: `migration/2-skeleton-v4`, created from `migration/1-decouple` (stacked; see story 12). Open a draft PR with base `migration/1-decouple`. After 12 is merged, rebase onto `main` and retarget the PR, as described in the epic's Assumptions.

## Description

Follow the [archived v2 → v4 guide](https://v4.skeleton.dev/docs/svelte/get-started/migrate-from-v2) and the [Tailwind v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide). **One commit per step.**

1. **Tailwind v4**
   - **Prep commit:** in [tailwind.config.ts](../../tailwind.config.ts), remove the `skeleton(...)` plugin, the `coffeeTheme` import and the Skeleton `content` path, so only `forms`, `containerQueries` and the screens remain. The upgrade tool can then convert the config completely (no `@config` fallback). Skeleton's CSS comes back in step 2. Before you start, check the order in the archived v2 → v4 guide; if it says to run the codemods before the Tailwind upgrade, follow the guide and note it in PROGRESS.md.
   - `pnpm dlx @tailwindcss/upgrade` (needs a clean working tree). If it fails on remaining Skeleton classes in `src/app.css`, temporarily comment them out, rerun, then restore them by hand.
   - Switch to the Vite plugin: `pnpm add -D @tailwindcss/vite`; add `tailwindcss()` **before** `sveltekit()` in [vite.config.ts](../../vite.config.ts); delete [postcss.config.js](../../postcss.config.js); remove `autoprefixer` and `postcss` (unless still required by another tool; check `pnpm why postcss`).
   - In `src/app.css`: `@import 'tailwindcss';`, `@plugin '@tailwindcss/forms';`, `@custom-variant dark (&:where(.dark, .dark *));` (current `darkMode: 'class'`). No `@theme` breakpoints: [src/lib/config/screens.ts](../../src/lib/config/screens.ts) matches v4's defaults (640/768/1024/1280/1536 px). Keep `screens.ts` (imported by Journal/MyCoffees) with a comment that it mirrors Tailwind's default breakpoints.
   - Remove `@tailwindcss/container-queries` (built into v4); `@container` classes keep working.
   - Delete [tailwind.config.ts](../../tailwind.config.ts).
2. **Skeleton codemods**
   - First check which migrations the CLI offers (`pnpm dlx skeleton@latest migrate --help`). If `skeleton-3`/`skeleton-4` are missing, use the newest CLI version that has them (`TODO: confirm`) and record the version in PROGRESS.md.
   - `pnpm dlx skeleton@latest migrate skeleton-3` → review the diff → commit `chore(deps): run skeleton-3 codemod`.
   - `pnpm dlx skeleton@latest migrate skeleton-4` → review → commit.
   - Pin `@skeletonlabs/skeleton` and `@skeletonlabs/skeleton-svelte` to **4.15.2** (the version the v5 guide requires as its starting point). Remove `@skeletonlabs/tw-plugin`.
   - In `src/app.css`: `@import '@skeletonlabs/skeleton';`, `@import '@skeletonlabs/skeleton-svelte';`, and a temporary preset theme (`@import '@skeletonlabs/skeleton/themes/cerberus';`) until story 14. Move `data-theme` from `<body>` to `<html>` in [src/app.html](../../src/app.html) and set it to `cerberus` until story 14 switches it to `coffee`. The `[data-theme='coffee']` mesh rules in `app.css` don't apply in between; that's expected.
   - Revert anything the codemod changed in `tests/`.
3. **Make it build:** for every wrapper in `src/lib/components/shared/ui/` that doesn't compile, keep its props interface and replace the body with a minimal placeholder (e.g. a native `<input type="checkbox">` for `Switch`, or `<div>` + `{@render}` for overlays) containing a comment `<!-- MIGRATION_PLACEHOLDER: <component> -->`. Hosts (`ModalHost`, `ToastHost`, `DrawerHost`) may render nothing but must not throw, so the app can load.
4. **Measure:** run `pnpm test:e2e:local` (failures expected) and `pnpm migration:status`. Write the list of failing tests grouped by wrapper into PROGRESS.md. This is the to-do list for 14–17.

## Acceptance criteria

- [x] `pnpm check`, `pnpm lint`, `pnpm build`, `pnpm test:unit` are green (e2e failures allowed in this story only).
- [x] `pnpm migration:status` shows `tailwind-v3` = 1 (only `theme.ts`, deleted in story 14); `v2-classes` and `migration-placeholders` counts recorded.
- [x] `tailwind.config.ts`, `postcss.config.js` deleted; `tailwindcss` ≥ 4, `@skeletonlabs/skeleton` and `@skeletonlabs/skeleton-svelte` = 4.15.2 in [package.json](../../package.json).
- [x] The app starts with `pnpm dev` and every route renders without a console error (placeholders allowed).
- [x] Each codemod run is its own commit.

## Technical notes

- Stop rule: if a codemod deletes logic (not just renames), revert that commit and do the step by hand for the affected files.
- `@skeletonlabs/skeleton` exports the CSS in v4; JS components come from `@skeletonlabs/skeleton-svelte`. Update `migration-status.js` so `skeleton-v2-imports-total` doesn't count the CSS import.
- Wrapper props must not change. Call sites stay untouched in phase 2.

### As built (2026-10-27)

- **Branch:** `migration/2-skeleton-v4` from `main`. Phase 1 was already merged, so there's no stacking, no rebase and no PR yet.
- **Order:** the archived v2 → v4 guide also upgrades Tailwind first, then runs `skeleton-3` and `skeleton-4`, committing in between.
- **Tailwind upgrade tool (4.3.3):** it converted the config and renamed utilities (`!` important as a suffix, `max-w-screen-*` → `max-w-(--breakpoint-*)`, `break-words` → `wrap-break-word`, `backdrop-blur-sm` → `-xs`). It also added a v3 border-colour compatibility block to `app.css`, which stays for now. The follow-up commit dropped its `@theme` breakpoints and widened the dark variant to `&:where(.dark, .dark *)`.
- **PostCSS:** `postcss` is now only a transitive dependency (eslint-plugin-svelte, vite), so it's removed from `package.json` along with `@tailwindcss/postcss` and `@tailwindcss/container-queries`.
- **Skeleton CLI 5.0.1:** it offers `skeleton-3`, `skeleton-4` and `skeleton-5`. The folder prompt is interactive, so it was driven through a pseudo-terminal with only `src/` selected; `tests/` stayed untouched.
  - `skeleton-3` renamed classes (`variant-*` → `preset-*`, `*-token` → paired tokens, `btn-xl` → `btn-lg`), switched imports to `skeleton-svelte` and moved `data-theme` to `<html>`. It dropped imports with no v3 equivalent (`Modal`, `Drawer`, `ListBox`, `popup`, `focusTrap`, `AppRailAnchor`, the v2 stores) but left the markup. No logic was deleted. It wrote `&nbsp;` in `Ratio.svelte` as a literal U+00A0, which was restored as the entity.
  - `skeleton-4` only bumped the versions, removed the presets import and renamed `Segment` → `SegmentedControl`.
- **Codemod commits skip the hooks:** both codemod commits fail ESLint (`no-undef` for the dropped imports), so the human approved `--no-verify` for exactly those two. The placeholder commit right after them passes all hooks.
- **Placeholders:** all 15 wrappers and hosts are native placeholders (checkbox switch, radios, range input, file input, plain listbox/pagination/links, and fixed-position modal, drawer and toast markup). Each keeps its props interface and is marked `MIGRATION_PLACEHOLDER`. The Popover placeholder positions itself once on open (`placement`, `matchWidth`) and keeps Tab inside its content (`trapFocus`), so no prop goes unused.
- **`theme.ts`** lost its `tw-plugin` type import (nothing imports the file any more). It remains only as the source for story 14.
- **`migration-status.js`** is unchanged: the v2 import regex doesn't match `@skeletonlabs/skeleton-svelte`, and CSS imports live in `.css` files outside its glob.
- **Status:** `tailwind-v3` 1 (`theme.ts`), `skeleton-v2-imports-total` 0, `v2-classes` 11 (input groups in `Estimation`, `MeasurementInput`, `UrlInput`), `migration-placeholders` 15.
- **E2e:** 110 passed, 14 failed. The list, grouped by wrapper, is in PROGRESS.md.
- Every route renders under `pnpm dev` in light and dark without console errors (the `[id]` routes were checked with unknown ids).

## Testing

- Gates above; e2e failures documented, not fixed.

## Out of scope

- Theme (14), real wrapper implementations (15, 16), remaining classes and input groups (17).
