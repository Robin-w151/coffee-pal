# 23: Checkpoint: approve SvelteKit 3 and ship

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Human
**Status:** Todo
**Depends on:** 22
**Size:** S — PR review, merge, a short device smoke test and, if used, a Docker image check.

## User story

As the project owner, I want to ship SvelteKit 3 and confirm production and the PWA work, so that the epic is complete.

## Description

Merging releases to production, and the device/Docker checks are outside Claude's reach.

### Runbook

#### Prerequisites

- [ ] Story 22 done; PR `migration/4-sveltekit-3` ready; CI green.
- [ ] Phone with the installed PWA.
- [ ] (If you use the Bun Docker image) Docker running locally, or access to wherever [image.yaml](../../.github/workflows/image.yaml) publishes.

#### Steps

1. **Review the PR,** mainly `vite.config.ts`, `package.json` (`imports`, versions) and `src/service-worker.ts`.
   **Expected:** no visual snapshot changes in the PR (this phase must not change the look).
2. **Squash-merge the PR**, keeping the title `chore(deps): upgrade to SvelteKit 3 (migration phase 4)` (patch release).
   **Expected:** CI → release → Vercel → Test workflow green.
3. **Phone smoke test:** update the PWA; open journal and settings; airplane mode → close and reopen the app.
   **Expected:** works online and offline; data intact.
4. **(Optional) Docker image:**
   ```sh
   docker build -f d.build.Dockerfile -t coffee-pal:sk3 . && docker run --rm -p 3000:3000 coffee-pal:sk3
   ```
   Open http://localhost:3000 (the Dockerfile has `EXPOSE 3000` and `CMD ["bun", "index.js"]`).
   **Expected:** the app loads.
   If you publish the image: GitHub → `Actions → Image → Run workflow` (it builds the latest version tag, i.e. this release; it never runs on its own).
   **Expected:** the workflow is green and the image is pushed.
5. **Close the epic:** tell Claude to set the epic status to Done.

#### Verify

- CI green on the merge commit; Test green on the deployment of the `chore(release)` commit; phone checks OK.

#### Rollback

1. **Immediately:** Vercel dashboard → `coffee-pal` → `Deployments` → the previous production deployment (the phase 3 release) → `⋯` → `Instant Rollback` (or `Promote to Production`). **Expected:** production runs SvelteKit 2 + Skeleton v5 again within a minute.
2. **Then in git:** on GitHub, `Revert` the merged PR, set the revert PR's title to `fix: revert migration phase 4`, and squash-merge it, so a release and production build follow (a plain `Revert "…"` title may not release, and Vercel only builds release commits on `main`). **Expected:** a new `chore(release)` commit and a production deploy.

No data format changes.

#### Hand back to Claude

- "SvelteKit 3 shipped" or the issue list; Dependabot PRs can be merged again from now on (close any stale ones; the next monthly run opens a fresh one against the new versions).

#### Troubleshooting

- **Vercel build fails** but local build works → check Vercel's Node version setting matches `engines.node` (24.x) and that `@sveltejs/adapter-auto` detects Vercel in v3.
- **Offline doesn't work after update** → roll back, tell Claude (service worker manifest injection).

## Acceptance criteria

- [ ] Given the merged PR, when production and the installed PWA are used, then they work online and offline.
- [ ] CI and Test workflows green (and the Image workflow, if you ran it).

## Technical notes

- [vercel.json](../../vercel.json), [d.build.Dockerfile](../../d.build.Dockerfile), [.github/workflows/image.yaml](../../.github/workflows/image.yaml).

## Out of scope

- Follow-up adoption of SvelteKit 3 features.
