# 20: Checkpoint: approve v5 and test PWA on device

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Human
**Status:** Todo
**Depends on:** 19
**Size:** M — a look review, a release, and a real-device PWA test (install, offline, update), which Claude can't do.

## User story

As the project owner, I want to approve the v5 look, ship it, and confirm the installed PWA works on my phone, so that the Skeleton and Tailwind part of the migration is done.

## Description

Look approval and real-device testing need you. This also approves the new screenshot baseline, which becomes the strict reference for phase 4.

### Runbook

#### Prerequisites

- [ ] Story 19 done; PR `migration/3-skeleton-v5` ready; CI green.
- [ ] Your phone with Coffee Pal installed as a PWA (home screen), with real data.
- [ ] A desktop browser for a quick check.

#### Steps

1. **Review v4 → v5 differences** in the PR description and the side-by-side page:
   ```sh
   git fetch origin && git switch migration/3-skeleton-v5 && pnpm install
   pnpm visual:review:base   # v4 baseline on main vs v5 baseline on this branch
   ```
   **Expected:** mostly spacing, typography and form-field changes; the coffee colours unchanged.
2. **Approve the new baseline:** page through `tests/visual/__screenshots__/` in the PR's "Files changed" (GitHub shows image diffs).
   **Expected:** you're happy for these to be the reference from now on.
3. **Touch test on the preview (phone):** open the PR's Vercel preview URL in your phone's browser (not the installed app). Create a journal entry, edit it, use autocomplete for coffee type, add aromas (tags), rate, delete it with the confirm dialog; open the menu drawer and close it with a swipe/backdrop tap. **Expected:** everything works with touch.
4. **Decide:** change requests → PR comments, tell Claude, repeat. Otherwise approve.
5. **Squash-merge the PR**, keeping the title `feat: move to Skeleton v5 (migration phase 3)` (minor release).
   **Expected:** CI → release → Vercel → Test workflow green.
6. **Device test (installed PWA on the phone):**
   1. Open the installed app and accept the update. **Expected:** the new version in Settings.
   2. Check settings and sync connection are unchanged; run a sync. **Expected:** success.
   3. Turn on airplane mode, close the app completely, reopen it. **Expected:** the app loads and shows your entries.
   4. Turn airplane mode off. **Expected:** no error toasts beyond a normal sync message.
7. **Fresh install test (optional, recommended):** in a private desktop browser window open https://coffee-pal.vercel.app, then install it via the install icon at the right end of the address bar (or `⋮ → Cast, save, and share → Install page as app…`). **Expected:** it installs and opens standalone.

#### Verify

- CI green on the merge commit; Test green on the deployment of the `chore(release)` commit.
- Preview touch test (step 3) and device checks 6.1–6.4 all OK.

#### Rollback

1. **Immediately:** Vercel dashboard → `coffee-pal` → `Deployments` → the previous production deployment (the phase 2 release) → `⋯` → `Instant Rollback` (or `Promote to Production`). **Expected:** production shows the v4 look within a minute.
2. **Then in git:** on GitHub, `Revert` the merged PR, set the revert PR's title to `fix: revert migration phase 3`, and squash-merge it, so a release and production build follow (a plain `Revert "…"` title may not release, and Vercel only builds release commits on `main`). **Expected:** a new `chore(release)` commit and a production deploy.

No data format changes in phase 3.

#### Hand back to Claude

- "v5 approved, PWA OK on <device/OS>", or a numbered list of issues with device, OS and steps.
- Go/no-go for phase 4 (SvelteKit 3).

#### Troubleshooting

- **The app doesn't update on the phone** → close it fully, reopen; on iOS, opening Safari to the URL once can trigger the SW update.
- **Offline reload shows the browser's offline page** → the service worker precache is broken; roll back and tell Claude (check `@vite-pwa/sveltekit` output in the build log).

## Acceptance criteria

- [ ] Given the PR preview, when it's used with touch on the human's phone, then the step 3 flow works.
- [ ] Given the v5 release, when the installed PWA is used on the human's phone, then device checks 6.1–6.4 pass.
- [ ] The new screenshot baseline is merged to `main` and approved.

## Technical notes

- PWA config: [vite.config.ts](../../vite.config.ts) (`SvelteKitPWA`, `injectManifest`), [src/service-worker.ts](../../src/service-worker.ts), manifest in `src/assets/manifest`.

## Out of scope

- SvelteKit 3 (21–23).
