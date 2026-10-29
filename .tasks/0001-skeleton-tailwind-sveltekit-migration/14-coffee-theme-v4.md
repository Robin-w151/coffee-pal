# 14: Coffee theme for Skeleton v4

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 13
**Size:** M — a hand conversion of ~90 theme properties into the new format, plus dark-mode and contrast tuning. Some uncertainty about how v4 names its contrast tokens.

## User story

As a user, I want the app to keep its coffee colours and mesh background with the new Skeleton look, so that it still feels like Coffee Pal.

## Description

Convert [theme.ts](../../theme.ts) **by hand** (decision 2026-10-23) into a v4 CSS theme at `src/themes/coffee.css`, following the v4 [custom theme docs](https://v4.skeleton.dev/docs/svelte/design/themes).

1. Look at the structure of a preset theme in `node_modules/@skeletonlabs/skeleton/dist/themes/cerberus.css` (or wherever v4 ships it) and use it as the template: `[data-theme='coffee'] { ... }`.
2. Map v2 → v4:
   - `--color-<name>-<shade>: R G B` → `--color-<name>-<shade>: rgb(R G B)` (or oklch; v4 accepts other formats). Keep all shades 50–950. v2 has no 950: derive it (darken 900 by ~10%) and note it in the file.
   - `--on-<name>` → the v4 contrast tokens (`--color-<name>-contrast-<shade>` / `--color-<name>-contrast-dark|light`, whatever v4 defines). Keep white text on primary/secondary/tertiary/error/surface and black on success/warning, as today.
   - `--theme-font-family-base|heading: system-ui` → v4 base/heading font family tokens.
   - `--theme-rounded-base|container: 16px` → v4 radius tokens; `--theme-border-base: 3px` → v4 default border width.
   - Base font colour and dark font colour → v4 body text tokens for light and dark.
3. Import it in `src/app.css`, remove the temporary `cerberus` import from story 13, and set `data-theme="coffee"` on `<html>` in [src/app.html](../../src/app.html).
4. Port the mesh background to `body` under the new attribute location: `[data-theme='coffee'] body { … }` and `.dark[data-theme='coffee'] body { … }` (the inline script in `app.html` puts `dark` on `<html>`), with the same gradients, `background-attachment: fixed` etc. This overrides the body background that Skeleton v4's base styles set from the theme; a mesh on `<html>` would be hidden behind it. The heading/link/button `font-weight: bold` rule keeps its `[data-theme='coffee'] h1, …` selectors (they still match as descendants). Port the `body` background only if story 11 kept it (see PROGRESS.md); then it becomes `var(--color-surface-50-950)`, or whatever pairing v4 provides.
5. Delete [theme.ts](../../theme.ts).
6. Check contrast with axe (story 04 suite): no new `color-contrast` violations. Fix colours where needed, preferring adjusted contrast tokens over changed brand colours.

## Acceptance criteria

- [x] `theme.ts` deleted; `src/themes/coffee.css` exists and is the only theme loaded.
- [x] For each palette (primary, secondary, tertiary, success, warning, error, surface), `getComputedStyle(document.documentElement).getPropertyValue('--color-<palette>-500')` resolves to the v2 value from `theme.ts` (e.g. primary `rgb(1 99 103)`), checked in an e2e test in `appShell.spec.ts`.
- [x] Given light and dark mode, when the journal list renders, then primary/secondary colours visibly match the old palette (Claude compares old v2 screenshots with new ones; differences are only in component shapes, not hues).
- [x] The mesh background is shown in light and dark: `getComputedStyle(document.body).backgroundImage` contains `radial-gradient` in both schemes, and the journal list screenshot shows it.
- [x] The a11y spec reports no new `color-contrast` violations compared with the baseline.
- [x] `pnpm check`, `lint`, `build`, `test:unit` green; the e2e failure list doesn't grow.

## Technical notes

- Keep a comment at the top of `coffee.css` with the v2 → v4 token mapping table, so story 19 can apply the v5 renames (`--typo-*`, `--color-root-bg-*`) reliably.

### As built (2026-10-27)

- `src/themes/coffee.css` was generated from `theme.ts` by a one-off script, so no colour was retyped by hand. The template is `node_modules/@skeletonlabs/skeleton/src/themes/cerberus.css`; v4 ships its themes under `src/`, not `dist/`. The mapping table is at the top of the file.
- **950 shades:** 900 with each channel × 0.9.
- **Contrast tokens:** `contrast-light` is white for every palette. `contrast-dark` is the palette's 950, except success and warning, which use black as v2's `--on-*` did. White starts at shade 500 for primary, secondary, tertiary, error and surface, and at 800 for success and warning.
- **Typography and shape:** `--base-font-color` is `surface-900`, and `--base-font-color-dark` is white. Heading weight is bold. The radii are 16px and `--default-border-width` is 3px. Divide and ring widths stay at 1px.
- **Mesh background:** it moved to `[data-theme='coffee'] body` and `.dark[data-theme='coffee'] body`. The unlayered rule beats Skeleton's `@layer base` body background. Story 11 had removed the separate `body` background rule, so there was nothing else to port.
- **Dark variant:** v4's `light-dark()` pairings depend on `color-scheme`, which Skeleton switches with the `dark` variant on `:root`. That's why story 13 widened the variant to `&:where(.dark, .dark *)`.
- **Also fixed:** `tsconfig.json` and `d.build.Dockerfile` still referenced the deleted `tailwind.config.ts`, `postcss.config.js` and `theme.ts`. Those references are a story 13 regression for the Dockerfile.
- **E2e:** new tests "coffee theme keeps the v2 palette" and "mesh background is shown in light/dark mode". The palette test resolves each variable through a probe element's computed colour, because the build minifies the theme to hex. Result: 113 passed, and the same 14 failures as story 13.
- **A11y:** no new violations in either scheme. `settings` even has fewer (`label`, `nested-interactive`) thanks to the native placeholders. The baseline is kept as is until checkpoint 18.
- Visual review notes are in PROGRESS.md.

## Testing

- `pnpm test:visual` (expected to differ): Claude reviews every diff image and records notes per screen in PROGRESS.md.

## Out of scope

- Component implementations (15, 16).
