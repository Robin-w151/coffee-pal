# 05: Checkpoint: approve safety net

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Human
**Status:** Done
**Depends on:** 02, 03, 04
**Size:** S — review a screenshot list and a PR, then merge; no live-system risk beyond a normal release.

## User story

As the project owner, I want to confirm the tests and screenshots cover what matters to me, so that Claude can rely on them for the rest of the migration without asking me.

## Description

Only you can judge whether important states are missing. After this checkpoint, Claude treats a green `pnpm verify` and `pnpm verify:strict` as "nothing broke".

### Runbook

#### Prerequisites

- [x] Stories 01–04 are Done and pushed to `migration/0-safety-net`; the Test workflow is green on the branch's Vercel preview deployment (see [PROGRESS.md](PROGRESS.md)).
- [x] A draft PR from `migration/0-safety-net` to `main` exists. Claude's batch run doesn't open PRs, so open it yourself (or ask Claude to):
  ```sh
  gh pr create --draft --base main --head migration/0-safety-net \
    --title "fix: add test hooks for migration safety net (migration phase 0)"
  ```
  The title is the `fix:` variant because `src/` changed (`aria-current`, the rail `<nav>` landmark, `data-testid`s on Rating and Aromas). CI must be green on the PR.
- [x] Local checkout with `pnpm install` done, on macOS (screenshots are macOS-specific).
- [x] Playwright browsers installed: `pnpm exec playwright install chromium`.

#### Steps

1. **Check out the branch**
   ```sh
   git fetch origin && git switch migration/0-safety-net && pnpm install
   ```
   **Expected:** branch checked out, install finishes without errors.
2. **Run the full gate yourself once**
   ```sh
   pnpm verify:strict
   ```
   **Expected:** exits 0 after ~1 min. The output ends with the visual suite passing (72 screenshots).
3. **Review the screenshot inventory.** Open `tests/visual/__screenshots__/phone/` and `.../desktop/` in Finder (Quick Look with Space lets you page through quickly).
   **Expected:** every screen and state you care about is there, in light and dark. Masked areas show as solid magenta boxes; none of them hides something you want checked. Note anything missing (e.g. "brew timer running", "sync error state").
4. **Skim the new tests** in the PR (`tests/specs/appShell.spec.ts`, `tests/specs/a11y.spec.ts`, extended specs). Check that the flows you rely on most are covered.
5. **Decide:** if something's missing, write the list as a PR comment or tell Claude in chat, and stop here. Claude adds it and you repeat from step 2.
6. **Mark the PR ready and squash-merge** on GitHub (`Pull requests → <PR> → Ready for review → Squash and merge`). Keep the PR title Claude set as the commit title: `fix: add test hooks for migration safety net (migration phase 0)` if the PR changes files under `src/` (e.g. new `data-testid`s), otherwise `test: add migration safety net (migration phase 0)`.
   **Expected:** CI green on `main`. With `fix:`: a patch release (`chore(release)` commit), a Vercel production deploy and a green Test run on it; the app looks and behaves the same. With `test:`: no release and no deploy (Vercel only builds release commits on `main`); production is unchanged.

#### Verify

```sh
git switch main && git pull && pnpm migration:status
```

**Expected:** the script runs on `main`; CI is green for the merge commit. Then run the Test workflow against production right away: GitHub → `Actions → Test → Run workflow` (leave `URL` empty, it defaults to `https://coffee-pal.vercel.app`; with a `fix:` merge, wait until the release deploy is done). It passes.

#### Rollback

Revert the squash commit (`git revert <SQUASH_SHA>` and push, or use GitHub's "Revert" button). This removes the tests and scripts, plus any test ids added to the app. Whether a plain `Revert "…"` commit triggers a release isn't guaranteed (and Vercel only builds release commits on `main`). If you want production to drop the test ids too, use GitHub's "Revert" button, title the revert PR `fix: revert migration phase 0` and squash-merge it; otherwise the (harmless) test ids stay in production until the next release.

#### Hand back to Claude

- "Safety net approved", or the list of missing screens/states/flows.

#### Troubleshooting

- **Visual tests fail on your machine** → run `pnpm test:visual` once more. If it still fails, run `pnpm exec playwright show-report` and open a failing test's diff image. Tell Claude which screens fail and whether the diff is noise (anti-aliasing, a few pixels) or a real difference. Don't update the snapshots yourself; Claude fixes the flakiness (masking, waits, threshold) as in story 04.
- **Port 4173 in use** → stop the other `vite preview`, or `lsof -i :4173` and kill the process.

## Acceptance criteria

- [x] Given the merged PR, when `pnpm verify:strict` runs on `main` locally, then it exits 0.
- [x] The human has confirmed coverage (or listed gaps that were then fixed).

## Technical notes

- Merging triggers [ci.yaml](../../.github/workflows/ci.yaml). With a `fix:` title, semantic-release creates a `chore(release)` commit, which Vercel builds for production ([scripts/trigger-new-build.js](../../scripts/trigger-new-build.js)) and which triggers [test.yaml](../../.github/workflows/test.yaml). With a `test:` title, none of that happens. See "Releases and deploys" in the epic.
- Why `fix:` when `src/` changed: the nightly Test run uses the tests from `main` against production. Without a deploy, tests relying on new test ids would fail every night until phase 1 ships.

## Out of scope

- App behaviour or visual changes (phase 0 only adds test ids; phase 1 starts with 06).
