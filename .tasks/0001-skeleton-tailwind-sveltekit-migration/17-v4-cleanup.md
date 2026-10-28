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

- [ ] `pnpm migration:status --phase 2` exits 0 (`v2-classes`, `migration-placeholders`, `skeleton-v2-imports-total`, `tailwind-v3` all 0).
- [ ] `pnpm verify` green; a11y no new violations.
- [ ] Every visual diff has been reviewed; PROGRESS.md lists per screen "OK – intended" or the fix made.
- [ ] The PR is ready for review, with the description above.

## Technical notes

- Don't update the visual snapshots in this story; the v2 baseline stays as the reference until the human approves v4 at checkpoint 18, after which Claude commits the v4 baseline.

## Testing

- Gates above.

## Out of scope

- v5 (19).
