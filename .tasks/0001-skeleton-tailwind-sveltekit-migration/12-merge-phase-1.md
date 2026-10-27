# 12: Merge phase 1 and check production data

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Human
**Status:** In Progress
**Depends on:** 11
**Size:** S — PR review plus one check on your phone that real settings survived; this ships a refactor to production.

## User story

As the project owner, I want the decoupling refactor in production on Skeleton v2 first, so that problems with the new persisted state or overlay services show up on a known-good UI, separately from the redesign.

## Description

Merging to `main` releases and deploys, so only you do it. The real-data check (your existing settings and sync connection) can't be automated. **This checkpoint doesn't block Claude:** phase 2 continues on a branch stacked on `migration/1-decouple` in the meantime.

### Runbook

#### Prerequisites

- [x] PR `migration/1-decouple → main` is open; CI is green.
- [x] A phone or browser where Coffee Pal is installed **with real data**: a non-default colour scheme or unit, and ideally a WebDAV sync connection.
- [x] Write down your current settings on the phone before updating: colour scheme, units, and the Nextcloud server URL and username shown in Settings (you'll need the app password again if the connection is lost).

#### Steps

1. **Review the PR.** Focus on `src/lib/services/ui/*`, `src/lib/components/shared/ui/*`, `src/lib/stores/settings.svelte.ts`, `src/lib/stores/sync.svelte.ts`.
   **Expected:** no call site outside `ui/` imports `@skeletonlabs/skeleton`.
2. **Open the PR's Vercel preview** (link in the PR's checks / deployments) and click through journal, my coffees, calculator, drip counter, settings. Open the menu, delete-confirm dialog (cancel it) and a popup.
   **Expected:** looks and behaves exactly like production.
3. **Squash-merge the PR** on GitHub, keeping the title `fix: decouple app from Skeleton v2 (migration phase 1)` as the commit title.
   **Expected:** CI green → semantic-release creates a patch release (`chore(release): 0.32.x` commit) → Vercel production deploy of that commit → Test workflow green. If no `chore(release)` commit appears, the title wasn't releasable: nothing was deployed (see Troubleshooting).
4. **Update the installed app** on your phone: open Coffee Pal and wait for the update prompt (`EnableUpdateListener`), or close and reopen it.
   **Expected:** the new version is shown in Settings (version number from the release).
5. **Check your data:** colour scheme and units are the same as before; Settings still shows your sync connection; trigger a sync.
   **Expected:** everything as before, and the sync succeeds.
6. **Check a second tab (desktop browser):** open the app in two tabs, change the colour scheme in one.
   **Expected:** the other tab follows (new `syncTabs` behaviour). This is fine.

#### Verify

On the phone: Settings shows your previous values and the sync connection; journal entries are all there.

#### Rollback

1. **Immediately:** Vercel dashboard → `coffee-pal` → `Deployments` → the previous production deployment (the release before this one) → `⋯` → `Instant Rollback` (or `Promote to Production`). **Expected:** production serves the old version within a minute.
2. **Then in git:** on GitHub, `Revert` the merged PR, set the revert PR's title to `fix: revert migration phase 1`, and squash-merge it. The `fix:` title guarantees a release, so the next production build is the reverted code (a plain `Revert "…"` title may not release, and Vercel only builds release commits on `main`). **Expected:** a new `chore(release)` commit and a production deploy.

- Data: the localStorage format is unchanged, so the old version reads it without problems.

#### Hand back to Claude

- "Phase 1 in production OK", or what went wrong (screenshots, browser/OS, console errors from desktop DevTools).
- "Phase 1 merged" (with the PR number). Claude then rebases `migration/2-skeleton-v4` onto `main`, force-pushes that branch with `--force-with-lease`, and changes the phase 2 PR's base to `main` (see the epic's Assumptions). Don't retarget the phase 2 PR yourself; without the rebase it would show all phase 1 commits again.

#### Troubleshooting

- **Settings reset to defaults after update** → roll back (Rollback step 1) so other users aren't affected, then re-enter your settings from the notes. Tell Claude: the serializer or key doesn't match (story 06 bug). If you still have a desktop tab open on the old version, copy `localStorage.settings` and `localStorage.sync` from DevTools → Application → Local Storage before reloading it, and give the values to Claude (without the password) for the fix.
- **No release / no production deploy after merging** → the squash commit title wasn't `fix:` (or another releasable type). Push an empty releasable commit to trigger it: `git commit --allow-empty -m "fix: release migration phase 1" && git push` on `main`.
- **Update prompt doesn't appear** → close all app windows/tabs and reopen; on iOS remove from the app switcher.

## Acceptance criteria

- [ ] Given the phase 1 release is deployed, when the installed app is opened on the human's phone, then settings and sync connection are unchanged.
- [ ] CI is green on the merge commit, and the Test workflow is green on the deployment of the `chore(release)` commit.

## Technical notes

- [ci.yaml](../../.github/workflows/ci.yaml) release job, [test.yaml](../../.github/workflows/test.yaml).

## Out of scope

- Visual changes (none expected in phase 1).
