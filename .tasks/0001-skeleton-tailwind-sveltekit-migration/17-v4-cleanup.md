# 17: Skeleton v4 cleanup and PR

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** In progress
**Depends on:** 14, 15, 16
**Size:** M — search-and-fix work across ~37 files plus 4 input groups; small individually, but many visual spots to check.

## User story

As Claude, I want no v2 classes or placeholders left and a reviewable PR with a screenshot comparison, so that the human can approve v4 in one sitting.

## Description

1. **Input groups → v4 `ig-*`** in [MeasurementInput.svelte](../../src/lib/components/shared/elements/form/MeasurementInput.svelte), [UrlInput.svelte](../../src/lib/components/shared/elements/form/UrlInput.svelte), [Estimation.svelte](../../src/lib/components/dripCounter/Estimation.svelte) and the rest of `grep -rln "input-group" src`, using the mapping from the v2 → v4 guide (`input-group-shim` → `ig-cell`, inputs → `ig-input`, selects → `ig-select`, buttons → `ig-button`, `input-group-divider` removed). Keep the `min-width` rules in `MeasurementInput.svelte` working by updating their selectors to the new classes (`.input-group-shim` → `.ig-cell`, `input` → `.ig-input`, `select` → `.ig-select`).
2. **Remaining v2 classes:** `pnpm migration:status` → fix every `variant-*` and `*-token` usage left by the codemod (e.g. `bg-surface-50-900-token` → `bg-surface-50-950`, `variant-filled-primary` → `preset-filled-primary-500`). Check the v4 docs for each pairing.
3. **Check pass:**
   - `pnpm migration:status --phase 2` exits 0.
   - `pnpm verify` green.
   - a11y: no new violations. If violations were fixed, shrink the baseline (`A11Y_UPDATE_BASELINE=1`) in a separate commit.
   - Run `pnpm test:visual`, review **every** diff, fix real defects (overflow, clipped text, invisible elements, broken spacing, wrong colours), and list remaining intended differences per screen in PROGRESS.md.
4. **PR for the human:**
   - `scripts/visual-review.js` builds `test-results/visual-review.html` from the last `test:visual` run: for every committed baseline in `tests/visual/__screenshots__/`, show the baseline next to Playwright's `-actual.png` (and `-diff.png`) from `test-results/**`, or mark the screen "unchanged" when no actual exists (Playwright only writes actuals for failing screenshots, and empties `test-results/` on every run). Add the script `visual:review`: `pnpm test:visual; node scripts/visual-review.js && open test-results/visual-review.html`. Keep the `;` after `pnpm test:visual`: it exits non-zero exactly when screenshots differ, which is when the review page is needed. Also add a `--base <git-ref>` mode that compares the baselines committed at `<ref>` (read with `git show <ref>:tests/visual/__screenshots__/…`) with the baselines in the working tree, and the script `visual:review:base`: `node scripts/visual-review.js --base origin/main && open test-results/visual-review.html` (used at checkpoint 20). Don't commit the output.
   - Push the branch and update the draft PR description: summary of 13–17, status table, link to PROGRESS.md, known differences, and how to open the review page (`pnpm visual:review`).
   - Set the PR title to `feat: move to Tailwind v4 and Skeleton v4 (migration phase 2)` (releasable; see "Releases and deploys" in the epic) and mark the PR ready for review.

## Acceptance criteria

- [x] `pnpm migration:status --phase 2` exits 0 (`v2-classes`, `migration-placeholders`, `skeleton-v2-imports-total`, `tailwind-v3` all 0).
- [x] `pnpm verify` green; a11y no new violations.
- [x] Every visual diff has been reviewed; PROGRESS.md lists per screen "OK – intended" or the fix made.
- [ ] The PR is ready for review, with the description above.

## Technical notes

- Don't update the visual snapshots in this story; the v2 baseline stays as the reference until the human approves v4 at checkpoint 18, after which Claude commits the v4 baseline.

### As built (2026-10-28)

- **Input groups:** `MeasurementInput`, `UrlInput` and Estimation use `ig-input`, `ig-select` and `ig-cell`. `input-group-divider` is gone (v4 always draws dividers). The minimum widths select the new classes (`[&_.ig-input]:min-w-40`, `[&_.ig-select]:min-w-24`) and no longer need `!important`, because no v2 rule competes. This fixed the white, unreadable unit fields in dark mode. The select-width e2e test still passes.
- **`input-error`:** v4 has no state classes for inputs, and six call sites use v2's `input-error`. `app.css` now defines it as an `@utility` (error ring plus a light error tint) that works on `.input` and `.input-group`, so the call sites stay unchanged.
- **Leftover v2 classes outside the status rule:**
  - `divider-vertical` → `vr` plus `border-t-0` on the `<hr>`.
  - `list-dl` was dropped (it did nothing visible).
  - `list-nav` (AppMenu) → explicit link layout, with hover only on inactive links.
  - `migration-status` now counts `list-nav`, `list-dl` and `divider-vertical` as v2 classes, and no longer counts `input-group` itself, which is valid in v4.
- **Cards:** v4's `card` has no background (v2's had the surface colour), so sections floated on the mesh, and the input outlines disappeared in light mode. PageCard, the active search header, the Nextcloud login modal and the confirm dialog use `bg-surface-50-950`, the pairing v4's form outlines are drawn against.
- **A11y:** v4's segmented controls and file upload fixed Settings' `label` and `nested-interactive` violations. The baseline was shrunk in its own commit (Settings now has none).
- **Review page:** `scripts/visual-review.js` plus `pnpm visual:review` and `pnpm visual:review:base` (`--base <ref>` compares committed baselines and embeds the images from git as data URIs). The output stays in `test-results/` (ignored).
- **Open for checkpoint 18 (design decision):** in dark mode, v4 draws field outlines in `surface-800`, and the coffee theme's 800/900/950 are very close, so outlines are only faintly visible on cards. The options are lightening the theme's dark surface shades (a brand change) or giving form fields a lighter ring colour in dark mode in `app.css`. Left as is for the human to decide.
- **PR (step 4):** stopped before it. In batch mode PRs need the human's explicit go-ahead.

## Testing

- Gates above.

## Out of scope

- v5 (19).
