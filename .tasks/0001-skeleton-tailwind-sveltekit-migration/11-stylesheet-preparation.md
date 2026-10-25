# 11: Stylesheet preparation

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 06, 08, 09, 10
**Size:** M — mechanical Sass-to-CSS conversion plus moving ~20 rules into ~13 owners, each move pixel-neutral against the v2 baseline.

## User story

As Claude, I want the global stylesheet to be plain CSS without `@apply` of Skeleton classes, so that the Tailwind v4 upgrade tool and the Skeleton codemods run cleanly in phase 2.

## Description

1. **Sass → CSS:** rename [src/app.scss](../../src/app.scss) to `src/app.css` (update the import in [AppLayout.svelte](../../src/lib/components/shared/app/AppLayout.svelte)). Convert `//` comments to `/* */`.
   - Flatten any nesting that remains in `app.css` (after item 2 nothing nested should remain) instead of adding `tailwindcss/nesting`. Components that need nesting use their own `<style>` blocks, which Svelte compiles.
   - Convert [AppDragHandle.svelte](../../src/lib/components/shared/app/AppDragHandle.svelte) `<style lang="scss">` to plain CSS.
   - Remove `sass` from `package.json`.
2. **Move every override and custom token into its owner** (if 08–10 didn't already), as component styles or Tailwind classes in the owner's markup. Each move must be pixel-neutral:

   | Rule(s) in `app.scss`                                                       | Owner                                                                                                                                                                                                                                         |
   | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `.modal-footer`, `.modal.dangerous`, `.modal-backdrop`, `.modal-transition` | `ui/ModalHost`                                                                                                                                                                                                                                |
   | `.toast`, `.toast-actions`, `.snackbar`                                     | `ui/ToastHost`                                                                                                                                                                                                                                |
   | `.popup-token`                                                              | `ui/Popover` (default surface)                                                                                                                                                                                                                |
   | `.autocomplete-token`, `.autocomplete-button`                               | `ui/Combobox`                                                                                                                                                                                                                                 |
   | `.app-rail-anchor`                                                          | `ui/NavRail`                                                                                                                                                                                                                                  |
   | `.radio-group-token`                                                        | `ui/SegmentedControl`                                                                                                                                                                                                                         |
   | `.range-slider-accent-token`                                                | `ui/Slider`                                                                                                                                                                                                                                   |
   | `.slide-toggle-active-token`                                                | `ui/Switch`                                                                                                                                                                                                                                   |
   | `.chip-interactive-token`                                                   | [Ratios.svelte](../../src/lib/components/calculator/sections/Ratios.svelte) (only user)                                                                                                                                                       |
   | `.page-header-title`                                                        | [PageHeader.svelte](../../src/lib/components/shared/elements/page/PageHeader.svelte) and [PageSearch.svelte](../../src/lib/components/shared/elements/page/PageSearch.svelte) (shared class in one of them, or a small `PageTitle` component) |
   | `.page-with-actions-token`, `.page-actions-token`                           | [PageCard](../../src/lib/components/shared/elements/page/PageCard.svelte) callers / [PageActions.svelte](../../src/lib/components/shared/elements/page/PageActions.svelte)                                                                    |
   | `.table` (rounded, striped rows, interactive transition)                    | [JournalEntriesTable](../../src/lib/components/journal/table/JournalEntriesTable.svelte) and [CoffeeEntriesTable](../../src/lib/components/myCoffees/table/CoffeeEntriesTable.svelte)                                                         |
   | `.input-group.measurement-input`                                            | [MeasurementInput.svelte](../../src/lib/components/shared/elements/form/MeasurementInput.svelte)                                                                                                                                              |

   Skeleton classes inside these rules (`card`, `chip`, `variant-*`, `*-token`, `h2`) move into the owner's markup as plain classes. That's allowed: `variant-*`/`*-token` in markup are handled by the codemod (13) and story 17.

   `body { @apply bg-surface-50-900-token }` is overridden by the mesh rule on `[data-theme='coffee']` (same element, higher specificity). Delete it; if `pnpm verify:strict` shows any pixel change, restore it as `background-color: rgb(var(--color-surface-50))` / `.dark body { … --color-surface-900 }` and note it in PROGRESS.md.

3. **What stays in `app.css`:** `@tailwind` directives, `:root` variables, `* { -webkit-tap-highlight-color }`, the heading/link/button font-weight rule, the coffee mesh background (light and dark), `html, body` sizing, the `body` background (only if restored, see item 2) and the view-transition rules.
4. Enable `--fail-on-warnings` in `verify` if story 01 deferred it.
5. Phase 1 wrap-up: `pnpm migration:status --phase 1` must exit 0. Push the branch, open a PR `migration/1-decouple → main` titled `fix: decouple app from Skeleton v2 (migration phase 1)` (the title must be releasable, or nothing deploys; see "Releases and deploys" in the epic) with a summary of 06–11, and write the PROGRESS.md entry.

## Acceptance criteria

- [x] `pnpm migration:status --phase 1` exits 0 (`scss`, `skeleton-apply-in-app-css` and all other phase-1 categories = 0).
- [x] `src/app.css` has no `@apply` of Skeleton classes; no `.scss` file or `lang="scss"` remains; `sass` is uninstalled.
- [x] `src/app.css` contains only the rules listed in item 3; every class from the mapping table is defined by its owner, and `grep -rn "chip-interactive-token\|popup-token\|autocomplete-token\|page-actions-token\|page-with-actions-token\|radio-group-token\|range-slider-accent-token\|slide-toggle-active-token" src/app.css` returns nothing.
- [x] `pnpm verify:strict` is green (pixel-equivalent to the v2 baseline within the threshold).
- [x] The phase 1 PR is open and links this epic.

## Technical notes

- Files: `src/app.css`, [package.json](../../package.json), the owners in the mapping table.
- `variant-*` / `*-token` classes in markup are **not** in scope: the `skeleton-3` codemod renames `variant-*` (story 13), and story 17 handles the rest.

### As built (2026-10-26)

- Some rules had already moved earlier: `.modal-footer` and `.modal.dangerous` (08), `.app-rail-anchor` and `.autocomplete-button` (10). The rest moved like this:
  - **Wrapper props/classes:** `.popup-token` → Popover's default `contentClass`; `.autocomplete-token` → Combobox's `contentClass`. `.radio-group-token` → `flexDirection="flex-col sm:flex-row"` plus `class="sm:min-w-[24rem]"`. Using the prop matters: as a class, `flex-col` would compete with v2's built-in `flex-row` utility. `.range-slider-accent-token` → Slider's `accent`; `.slide-toggle-active-token` → Switch's `active`.
  - **Elements Skeleton renders itself:** `.modal-backdrop` → `regionBackdrop="overflow-hidden"`; `.toast` → the per-toast `classes` setting.
  - **Plain CSS in the host's `<style>`, for elements with no prop:** `.modal-transition`, `.snackbar`, `.toast-actions`. The selectors carry an extra ancestor class (`.modal-backdrop .modal-transition`, `.snackbar-wrapper .snackbar`), so they outrank v2's utilities however the component CSS is ordered.
  - **Tables:** `rounded-md`, plus `[&_tbody_tr:nth-child(2n)]:bg-surface-200-700-token` on the `<table>`. That arbitrary variant keeps the original selector and specificity (0,2,2), which beats Skeleton's `.table tbody tr:nth-child(even)`, and its hover rules (0,4,2) still win. `transition ease-out` sits on the entry rows, which only exist when the table is interactive.
  - **`.input-group.measurement-input`** → `!min-w-[10rem]` / `!min-w-[6rem]` on the input and the select or shim, in MeasurementInput and in Estimation (which had the same markup).
  - **`.page-header-title`** → a new `PageTitle.svelte`, used by PageHeader and PageSearch.
  - **Page and chip tokens:** `.page-with-actions-token` → `mb-24` on both PageCards; `.page-actions-token` and `.chip-interactive-token` → classes in PageActions and Ratios.
- `body { @apply bg-surface-50-900-token }` was deleted without any pixel change (all 72 screenshots match), so it wasn't restored.
- `html, body` sizing is plain CSS (`height: 100%; overflow: hidden`).
- Build size:
  - CSS: 129,452 → 122,398 bytes.
  - Client output: 6,832 → 6,828 KB.
- `--fail-on-warnings` was already on since story 01 (`check:strict` in `verify`).
- **PR:** opened at the human's request as draft [#188](https://github.com/Robin-w151/coffee-pal/pull/188) (`fix: decouple app from Skeleton v2 (migration phase 1)`), linking the epic.

## Testing

- `pnpm verify:strict`; `pnpm build` output size roughly unchanged (note it in PROGRESS.md).

## Out of scope

- Tailwind v4 (13), theme conversion (14).
