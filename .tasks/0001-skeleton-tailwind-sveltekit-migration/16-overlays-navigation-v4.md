# 16: Overlays, lists and navigation on v4

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** In progress
**Depends on:** 13
**Size:** L — the most interactive parts of the app (dialogs, drawer, toasts, popovers, combobox, navigation), and a shift from stores to components.

## User story

As a user, I want menus, dialogs, notifications, search popups, suggestions, lists, pagination and navigation to work as before with the new look.

## Description

Reimplement the internals of the story 08 and 10 components with v4.15.2. Service APIs (`src/lib/services/ui/*`) and wrapper props stay unchanged.

1. **`ModalHost`** → v4 `Dialog`: render the head of the modal queue; `modal.confirm()` dialogs with title, body and two buttons (`dangerous` → error preset for the confirm button); custom components from `modal.open()`. Focus trap and Escape come from Dialog.
2. **`DrawerHost`** → v4 `Dialog` styled as a left-side drawer (as in the v4 docs' drawer example), rendering `AppMenu` for `app-menu`.
3. **`ToastHost`** → v4 toaster: `ToastHost` calls `createToaster()` and renders `<Toast.Group>`; `toast.svelte.ts` stays Skeleton-free (story 08 rule: only hosts import Skeleton) and keeps its queue of toasts as `$state`. The host syncs that queue into the toaster and reports closes back to the service. Mapping: `timeout` → `duration`, `persistent` → `duration: Infinity`, `action` → the toast's action button, `onClose` → fired once when the toaster reports the toast as dismissed/removed, `toast.dismiss(id)` → `toaster.dismiss(id)`.
4. **`Popover`** → v4 `Popover`, with trigger and content parts mapped to the snippets. Remove `@floating-ui/dom` if nothing else uses it (`grep -rn floating-ui src`).
5. **`Combobox`** → v4 `Combobox`; keep filtering behaviour and keyboard handling from the tests.
6. **`Pagination`** → v4 `Pagination`.
7. **`NavRail`** → v4 `Navigation` with `layout="rail"`; active state from the current route.
8. **`Listbox`**, **`AppBar`** → v4 `Listbox` and `AppBar` (both in 4.15.2, confirmed 2026-10-25).

One commit per component. After each: related e2e tests, placeholder count, screenshots.

## Acceptance criteria

- [ ] `pnpm migration:status` shows `migration-placeholders` = 0 (together with 15).
- [ ] All app shell and overlay e2e tests (02) and the Autocomplete/ListBox/Paginator tests (03) are green, unchanged.
- [ ] Given a confirm dialog is open, when Tab is pressed repeatedly, then focus stays inside it; after closing, focus returns to the trigger.
- [ ] Given a toast is shown on the phone viewport, then it doesn't cover the app bar's menu button permanently (it auto-dismisses or can be dismissed).
- [ ] `grep -rn "@skeletonlabs" src/lib/services/ui` returns nothing.
- [ ] No new a11y violations.
- [ ] The failing-test list in PROGRESS.md is updated: the entries for these components are gone, and no new entries were added.
- [ ] `pnpm verify` green (if 15 is done; otherwise all specs except those covering 15's components).

## Technical notes

- Docs: `https://v4.skeleton.dev/docs/svelte/framework-components/{dialog,toast,popover,combobox,pagination,navigation}`; drawer pattern under the dialog docs.
- Stop rule: if a v4 component can't reproduce a tested behaviour (e.g. Combobox free-text entry), ask the human whether to keep the behaviour (custom implementation) or drop it.

## Testing

- Per-component e2e runs; full `pnpm verify` at the end; screenshot review notes in PROGRESS.md.

## Out of scope

- Input groups and leftover classes (17).
