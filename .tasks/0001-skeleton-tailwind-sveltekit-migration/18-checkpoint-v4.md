# 18: Checkpoint: approve v4 and ship

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Human
**Status:** Todo
**Depends on:** 12, 17
**Size:** S — look-and-feel review and one merge. It's the first visible change for users, but rollback is an instant Vercel rollback plus a revert.

## User story

As the project owner, I want to approve the new look and ship Tailwind v4 + Skeleton v4 to production, so that the app is on supported versions even if v5 takes longer.

## Description

Only you can judge whether the new look is acceptable. Shipping is a release.

### Runbook

#### Prerequisites

- [ ] Story 12 is done (phase 1 merged), and Claude has rebased `migration/2-skeleton-v4` onto `main`, so its PR targets `main` and contains only phase 2 commits.
- [ ] Story 17 is done; the PR is ready for review and CI is green.
- [ ] Local checkout on macOS for the side-by-side page.

#### Steps

1. **Open the side-by-side review**
   ```sh
   git fetch origin && git switch migration/2-skeleton-v4 && pnpm install
   pnpm visual:review
   ```
   **Expected:** a page with old (v2) and new (v4) screenshots for each screen and state. The visual tests "fail"; that's expected here.
2. **Read the "known differences" list** in the PR description and [PROGRESS.md](PROGRESS.md).
3. **Click through the PR's Vercel preview** (link in the PR's checks / deployments) on phone width and desktop: journal, entry detail/edit, my coffees, calculator, drip counter, settings; open the menu, a delete dialog, a popup, autocomplete, tags input, file import; switch dark mode.
   **Expected:** everything works; the look is the new Skeleton style with coffee colours.
4. **Decide:**
   - Changes needed → list them as PR comments (one per issue, with a screenshot if possible) and tell Claude. Claude fixes them on the branch; repeat from step 1.
   - Approved → tell Claude "v4 approved". Claude runs `pnpm test:visual:update` on `migration/2-skeleton-v4`, commits `test(visual): update baseline to Skeleton v4`, pushes, and waits for CI. Then continue with the merge. (This keeps `pnpm verify:strict` green on `main` after the merge and gives checkpoint 20 a committed v4 reference.)
5. **Squash-merge the PR** on GitHub, keeping the title `feat: move to Tailwind v4 and Skeleton v4 (migration phase 2)` (minor release).
   **Expected:** CI → release → Vercel production → Test workflow green.
6. **Update the installed PWA on your phone** (as in story 12, step 4) and do a 2-minute smoke test: add a journal entry, open it, delete it.

#### Verify

- GitHub Actions: CI green on the merge commit; Test green on the deployment of the `chore(release)` commit.
- Phone: new look, settings and sync connection intact.

#### Rollback

1. **Immediately:** Vercel dashboard → `coffee-pal` → `Deployments` → the previous production deployment (the phase 1 release) → `⋯` → `Instant Rollback` (or `Promote to Production`). **Expected:** production shows the v2 look within a minute.
2. **Then in git:** on GitHub, `Revert` the merged PR, set the revert PR's title to `fix: revert migration phase 2`, and squash-merge it, so a release and production build follow (a plain `Revert "…"` title may not release, and Vercel only builds release commits on `main`). **Expected:** a new `chore(release)` commit and a production deploy.

User data isn't affected (no data format changes in phase 2).

#### Hand back to Claude

- "v4 approved and shipped", or the list of requested changes.
- Any design wishes for v5 (story 19 uses the v5 defaults otherwise).

#### Troubleshooting

- **Review page missing, or every screen marked "unchanged"** → the build or the visual run failed before taking screenshots (scroll up in the `pnpm visual:review` output for the error), or you're not on `migration/2-skeleton-v4` (`git branch --show-current`).
- **PR still targets `migration/1-decouple`, or shows phase 1 commits** → the post-merge rebase hasn't happened. Don't change the base by hand; tell Claude "phase 1 merged, rebase phase 2" and wait for the force-push and retarget.

## Acceptance criteria

- [ ] Given the merged PR, when production is opened, then it runs Tailwind v4 + Skeleton 4.15.2 (check `package.json` on `main`) and the Test workflow is green.
- [ ] The human approved the look (PR approval or chat confirmation).

## Technical notes

- This is the planned stable stop: production can stay on v4 indefinitely if phase 3 stalls.

## Out of scope

- v5 (19, 20).
