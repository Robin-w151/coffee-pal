# 19: Skeleton v5 upgrade

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 18
**Size:** M — an official codemod plus a short list of manual changes (Field Groups, icon sizes, theme tokens); the wrappers keep the blast radius small.

## User story

As the project owner, I want the app on Skeleton v5, so that it's on the current major version and gets fixes and new components.

Branch: `migration/3-skeleton-v5` from `main` (after 18). Draft PR to `main`.

## Description

Follow the [v4 → v5 guide](https://www.skeleton.dev/docs/svelte/get-started/migrate-from-v4).

1. Check that the Svelte peer requirement (≥ 5.40) is met (currently 5.56.x).
2. `pnpm dlx skeleton@latest migrate skeleton-5` → review → commit. It handles package versions, design token renames and utility class renames.
3. Manual steps:
   - **Input Group → Field Group:** the `ig-*` markup from story 17 → `field-group` with `label`/`span`, `input` and `select` classes. Update the `min-width` selectors in `MeasurementInput.svelte` to the field-group markup.
   - **Icons:** remove `size` props and manual icon sizes inside buttons/badges/chips; use `size-elem-*` classes where a size is needed. The app uses `svelte-awesome` icons (`grep -rn "svelte-awesome" src`). Check whether they pick up the new automatic sizing, and set sizes via classes where they don't.
   - `card-hover` → remove (cards on links/buttons get hover styles automatically); `btn-icon-fab` → new `btn-{size}` utilities; remove `@variant theme-*` if any.
   - **Theme** `src/themes/coffee.css`: apply token renames (`--typo-*`, `--color-root-bg-*`), using the mapping comment from story 14. Remove the dropped tokens (`--default-divide-width`, `--heading-font-size`, `--heading-line-height`) and re-apply `system-ui` fonts through the new typography tokens.
   - The brand colour is now the default accent for checkbox/radio/switch/slider/tabs: check that it's coffee primary.
4. Gates: `pnpm migration:status --phase 3` exits 0; `pnpm verify` green; a11y no new violations; review all visual diffs against the v4 baseline (committed at checkpoint 18) as in story 17.
5. **New visual baseline:** once everything is green and reviewed, run `pnpm test:visual:update` and commit the new snapshots as a separate commit `test(visual): update baseline to Skeleton v5`. From here, `pnpm verify:strict` is the gate again. The human compares v4 and v5 with `pnpm visual:review:base` (committed baseline on `main` vs this branch), so no local copies are needed.
6. Push, set the PR title to `feat: move to Skeleton v5 (migration phase 3)` (releasable; see "Releases and deploys" in the epic), and mark the PR ready.

## Acceptance criteria

- [x] `@skeletonlabs/skeleton` and `@skeletonlabs/skeleton-svelte` are on the latest 5.x.
- [x] `pnpm migration:status --phase 3` exits 0.
- [x] `pnpm verify:strict` is green with the new baseline, 3 consecutive runs.
- [x] No new a11y violations.
- [x] The PR is ready for review with a v4 → v5 differences list in its description and PROGRESS.md.

## Technical notes

- The codemod is the same CLI as in story 13 (`skeleton@latest migrate`), with the `skeleton-5` task.
- The wrappers' props don't change; only `ui/` internals, `coffee.css` and markup classes.

### As built (2026-11-01)

- **Codemod:** `skeleton@5.0.1 migrate skeleton-5` (pinned; the auto-mode classifier refused `@latest`) only changed `package.json` (set to the exact `5.0.1`). A second run on `src/` was refused too, so its mappings (read from the CLI source: token renames, `input-group`/`ig-*` → `field-group`/`input`/`select`, removed and added tokens) were applied by hand. Nothing in the app used `card-hover`, `btn-icon-fab` or `@variant theme-*`.
- **Theme:** `--typo-*` and `--color-root-bg-*` tokens, `--default-divide-width` dropped, the new tokens with the codemod's defaults: `--corner-shape-*: initial` keeps round corners, `--color-brand-*` is coffee primary (checkbox, switch, slider and filled accents unchanged).
- **Field groups:** cells are `input`, `select` and `label` (the plain cells); `label` cells get the fields' background and outline; `input-error` colours every cell. The `min-width` selectors target `.input`, `.select` and `.label`.
- **Sizes:** v5 sizes fields, buttons and chips from one variable with a line as tall as the text. Fields and buttons keep 42px with a 24px line. Icon buttons keep 42/28/53px through `--btn-size` (22/15/27.5px), so their icons follow v5's automatic sizing and the manual `scale` props in buttons are gone; there are no `size-elem-*` utilities in 5.0.1. Chips and badges keep v4's `text-xs` through `--chip-size` and `--badge-size` (v5's badges at 9.6px made the journal ratios hard to read). Blocks that only set custom properties land after Skeleton's rules, so these don't depend on rule order (the old fixed `btn-icon` sizes lost to v5's).
- **Borders:** the theme's `--default-border-width` is 1px: v5 makes it the width of Tailwind's `border` (3px made outlined buttons thick).
- **Tags input:** v5's delete trigger is a fixed 12px; the wrapper's trigger holds the whole tag, so it gets `size-auto` and padding, and the preview drops its button padding.
- **Field-group cells:** plain (`label`) cells are left-aligned like the select units; v5 centres them.
- **Combobox:** with no matching option, the popup shows "No results found" as a disabled option (v2's empty state; a listbox needs option children).
- **Placeholders:** v5 colours them through `--field-placeholder`, now gray-500 in `:root`.
- **Gates:** `migration:status --phase 3` exits 0; `pnpm verify:strict` green 3× (194 unit, 128 e2e incl. a11y, 72 visual); new baseline `7f3fb95`. PR [#192](https://github.com/Robin-w151/coffee-pal/pull/192).

## Testing

- Gates above.

## Out of scope

- SvelteKit 3 (21–22).
