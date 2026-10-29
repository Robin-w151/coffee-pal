# 16: Overlays, lists and navigation on v4

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
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

- [x] `pnpm migration:status` shows `migration-placeholders` = 0 (together with 15).
- [x] All app shell and overlay e2e tests (02) and the Autocomplete/ListBox/Paginator tests (03) are green. Their assertions are unchanged; one interaction (keyboard selection in the sort list) was adapted under the phase 2 test rule.
- [x] Given a confirm dialog is open, when Tab is pressed repeatedly, then focus stays inside it; after closing, focus returns to the trigger.
- [x] Given a toast is shown on the phone viewport, then it doesn't cover the app bar's menu button permanently (it auto-dismisses or can be dismissed).
- [x] `grep -rn "@skeletonlabs" src/lib/services/ui` returns nothing.
- [x] No new a11y violations.
- [x] The failing-test list in PROGRESS.md is updated: the entries for these components are gone, and no new entries were added.
- [x] `pnpm verify` green (if 15 is done; otherwise all specs except those covering 15's components).

## Technical notes

- Docs: `https://v4.skeleton.dev/docs/svelte/framework-components/{dialog,toast,popover,combobox,pagination,navigation}`; drawer pattern under the dialog docs.
- Stop rule: if a v4 component can't reproduce a tested behaviour (e.g. Combobox free-text entry), ask the human whether to keep the behaviour (custom implementation) or drop it.

### As built (2026-10-28)

One commit per component, plus two follow-ups: `@floating-ui/dom` is removed, and a commit that makes the overlays close without waiting for Zag (see below).

- **`AppBar`:** `AppBar.Toolbar/Lead/Headline` with v2's padding. The root renders a `div` through its `element` snippet, because AppLayout's `<header>` is already the banner landmark.
- **`NavRail`:** `Navigation layout="rail"` with a `TriggerAnchor`/`TriggerText` per route. The active route gets `preset-filled-primary-500` and `aria-current`. The menu is top-aligned as in v2 (v4 centres it).
- **`Pagination`:** first/prev/items/ellipsis/next/last, mapping the app's 0-based page to v4's 1-based one, centred in a flex row. The wrapper names the triggers "First/Previous/Next/Last page", because v4 labels only previous/next, in lower case. 4.15.2's first/last triggers have no disabled state and lack the `data-scope`/`data-part` attributes that its own styles select, so the wrapper sets both.
- **`Listbox`:** `Listbox.Content/Item/ItemText` over `useListCollection`. Clicks and Enter select directly and call `onSelect`, also for the current option; `onValueChange` only keeps `value` in sync. _Test change:_ v4 keeps focus on the list and highlights options, so "sort list box selects with the keyboard" selects through `JournalPage.selectSortOptionWithKeyboard` (type-ahead + Enter) instead of pressing Enter on an option.
- **`Popover`:** `Popover.Trigger` renders the trigger snippet with v4's attributes, so `PopoverTriggerProps` are now plain attributes instead of attachments; the callers' spreads are unchanged. `placement`/`matchWidth` map to `positioning`, `trapFocus` to `modal`, `portal` to Skeleton's `Portal`, and `focus-click` also opens on focus. Choosing something in the content (click or Enter) closes the popover, as before. Since the Combobox moved to v4's own Combobox, PageSearch is the only caller, and nobody passes `openOn`, `placement`, `matchWidth`, `portal` or `trapFocus` any more. Whether to keep them is an open point for story 17.
- **`Combobox`:** v4 `Combobox` over a `useListCollection` of the contains-filtered options, portalled, as wide as the input. Free text stays (`allowCustomValue`), and the input text is the bound value. Only typing is reported through `onInputChange` (`reason === 'input-change'`); otherwise selecting a coffee entry would overwrite it with its label and the "Open coffee entry" link would disappear. It opens on focus and click.
- **`ModalHost`:** a portalled v4 `Dialog` shows the head of the queue: confirm dialogs (title, description, Cancel, Confirm with the error preset when `dangerous`) or the custom component with its `close`. The focus trap and the return of focus to the trigger come from the Dialog (verified: after Cancel, "Clear IndexedDB" has focus again).
- **`DrawerHost`:** the same Dialog, laid out as a left-side drawer. `Dialog.Content` is mounted only while the drawer is open: a mounted, closed one broke Escape and outside clicks of the other overlays.
- **`ToastHost`:** `createToaster({ placement: 'bottom' })` and `Toast.Group`. The service keeps owning the timeouts (toaster `duration: Infinity`). Toasts the service drops are dismissed in the toaster, and toasts closed in the toaster (close button, action) are dismissed in the service, which runs `onClose` once. `role="alert"` as with v2 (v4 uses `status`), and the close button is labelled "Dismiss toast". On the phone it sits at the bottom centre, clear of the menu button.
- **Closing without Zag's dismiss layer:** Zag registers Escape and outside-click handling only after an overlay has set itself up. Input right after opening was lost: tests failed under parallel load, and a fast keyboard user could hit it too. So `ModalHost`, `DrawerHost` and `Popover` turn off `closeOnEscape`/`closeOnInteractOutside` and close on Escape, backdrop/positioner clicks and outside pointerdowns themselves. Each closes only once, so a queued modal stays open. The Dialog sets `pointer-events: none` on `<body>` while open, so the backdrop (and the modal's full-screen positioner) take pointer events back with `pointer-events-auto`. The Combobox closes on Escape itself as well. None of these overlays contains another, so Zag's layer stack isn't needed. With this, the overlay specs passed 3× in a row with `--repeat-each 3`.
- `grep -rn "@skeletonlabs" src/lib/services/ui` returns nothing. `migration-placeholders` is 0.
- **Gates:** `pnpm verify` green (194 unit, 127 e2e). A11y: no new violations.

## Testing

- Per-component e2e runs; full `pnpm verify` at the end; screenshot review notes in PROGRESS.md.

## Out of scope

- Input groups and leftover classes (17).
