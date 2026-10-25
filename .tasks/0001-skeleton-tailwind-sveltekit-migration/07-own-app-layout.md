# 07: Own app layout instead of AppShell

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Todo
**Depends on:** 05
**Size:** M — one central layout component, but scroll restoration, view transitions and the drawer all depend on it, and the result must match the v2 screenshots.

## User story

As Claude, I want the app layout to be plain Svelte + Tailwind instead of Skeleton's `AppShell`, so that the layout survives the Skeleton upgrade unchanged (`AppShell` is removed in v3+, and the official advice is custom layouts).

## Description

1. In [AppLayout.svelte](../../src/lib/components/shared/app/AppLayout.svelte), replace `<AppShell>` with a CSS grid layout of your own (decision 2026-10-25): header (`AppBar`), left sidebar (`AppRail`, hidden below `md`), and a scrolling page region. The grid must reproduce v2's box geometry exactly, so the pixel-identical phase 1 gate tests the layout, not the swap:
   - Container: `display: grid; grid-template-columns: auto minmax(0, 1fr); grid-template-rows: auto minmax(0, 1fr); height: 100%` (fills `body`, like v2's `#appShell` with `h-full`).
   - `<header>` spans both columns (`grid-column: 1 / -1`); `<aside>` sits in row 2, column 1 (hidden below `md`, so the `auto` column collapses to 0 on phone); `<main id="page">` sits in row 2, column 2 and is the only scroll container (`overflow-y: auto`).
   - `minmax(0, …)` on the page track (or `min-height: 0` / `min-width: 0` on `#page`) is required; without it the grid item grows with its content and the page stops scrolling inside `#page`.
   - Carry over the classes v2 puts on its regions (resolve the computed `classes*` values in `node_modules/@skeletonlabs/skeleton/dist/components/AppShell/AppShell.svelte`), e.g. the header's stacking (`z-10`) and the sidebar's `overflow-y-auto`, onto the matching grid items.
   - If screenshots differ, compare the element boxes of v2 and the grid (DevTools, or `boundingBox()` of header, aside and `#page` on both builds) and fix the grid until they match. Never update the snapshots in this story; after 3 genuine attempts the epic's stop rule applies.
   - Keep the scroll container's id `page` (used by `afterNavigate` → `document.querySelector('#page')`) and the `scroll` handler that calls `rememberScrollPosition($page.url.pathname, scrollTop)`.
   - Reproduce `scrollbarGutter="stable"` (`scrollbar-gutter: stable`) and `regionPage="outline-offset-[-3px]"`.
   - The page region must stay the only scrolling element (`html, body { height: 100%; overflow: hidden }` stays for now; it's in [src/app.scss](../../src/app.scss) under "AppShell overrides").
   - Only [scroll.ts](../../src/lib/shared/ui/scroll.ts) depends on AppShell's DOM (`#page`); keep that id. [viewTransition.ts](../../src/lib/shared/viewTransition.ts) makes no DOM assumptions. Retype `handleAppShellScroll` as a plain `onscroll` handler (`(event: Event & { currentTarget: HTMLDivElement })`) and rename it `handlePageScroll`. Rename the "AppShell overrides" comment in `app.scss` to "Layout".
2. Replace `ConicGradient` in [Spinner.svelte](../../src/lib/components/shared/elements/Spinner.svelte) with a `div` using `background: conic-gradient(transparent 25%, currentColor 75%)`, a circular mask (or `rounded-full` with an inner cut-out, matching today's look) and `animate-spin`. The colour comes from `currentColor`: default class `text-primary-500`. Replace the `color` prop with the normal `class` prop; the one caller that passes a colour ([PageActions.svelte](../../src/lib/components/shared/elements/page/PageActions.svelte), `color="white"`) passes `class="text-white"`. Keep `width` (default `w-6`). Today's default `rgb(var(--color-primary-500))` only works with v2's RGB-triplet theme variables and would make the spinner invisible in phase 2.
3. Leave `Modal`, `Toast`, `Drawer` in place for now (story 08 replaces them).

## Acceptance criteria

- [ ] `pnpm migration:status` shows `app-shell` = 0 and `conic-gradient` = 0.
- [ ] `grep -rn "rgb(var(--color" src/lib/components` returns nothing.
- [ ] Scroll restoration e2e test (story 02) is green.
- [ ] Layout screenshots match the v2 baseline on phone and desktop (`pnpm verify:strict` green).
- [ ] Keyboard focus order is unchanged: skip-to-content behaviour (if any), header → rail → page.
- [ ] No new a11y violations (landmarks: `header`, `nav`, `main` exist).

## Technical notes

- Use semantic elements: `<header>`, `<aside>`/`<nav>`, `<main id="page">`.
- Skeleton v2's AppShell markup for reference: `node_modules/@skeletonlabs/skeleton/dist/components/AppShell/AppShell.svelte`. It's a flex layout (`#page` is a `div` wrapping `<main id="page-content">`); the grid replaces the structure but keeps its geometry and region classes. `<main id="page">` becoming the scroll container doesn't change pixels, and scroll restoration only needs the `#page` id.

## Testing

- `pnpm verify:strict`; if screenshots differ, inspect the diff images in `test-results/` and fix the layout, not the snapshots.

## Out of scope

- `AppRail`/`AppBar` internals (10), overlays (08).
