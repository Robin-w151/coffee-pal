# 19: Skeleton v5 upgrade

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Todo
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

- [ ] `@skeletonlabs/skeleton` and `@skeletonlabs/skeleton-svelte` are on the latest 5.x.
- [ ] `pnpm migration:status --phase 3` exits 0.
- [ ] `pnpm verify:strict` is green with the new baseline, 3 consecutive runs.
- [ ] No new a11y violations.
- [ ] The PR is ready for review with a v4 → v5 differences list in its description and PROGRESS.md.

## Technical notes

- The codemod is the same CLI as in story 13 (`skeleton@latest migrate`), with the `skeleton-5` task.
- The wrappers' props don't change; only `ui/` internals, `coffee.css` and markup classes.

## Testing

- Gates above.

## Out of scope

- SvelteKit 3 (21–22).
