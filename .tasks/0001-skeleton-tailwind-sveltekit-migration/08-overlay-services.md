# 08: Overlay services and hosts

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Todo
**Depends on:** 05
**Size:** L — 11 store consumers plus 3 popup sites, custom modal components, and a new API design. v4 replaces the store-based model with components, so this is the riskiest part of phase 1.

## User story

As Claude, I want the app to open modals, toasts, the drawer and popovers through app-owned services and components, so that phase 2 only has to reimplement those, not the 14 call sites.

## Description

Build an app-owned API with **no Skeleton types in its signatures**. In phase 1 it is backed by the v2 stores and the `popup` action.

1. **Services** in `src/lib/services/ui/` (`.svelte.ts` files). Same shape as the stores in story 06 (interface + class with `$state`/`$derived` fields and arrow-function methods, following [orfarchiv-ui `skeleton.svelte.ts`](https://github.com/Robin-w151/orfarchiv-ui/blob/develop/src/lib/stores/runes/skeleton.svelte.ts)), but each module exports a **module-level singleton** instead of `get…`/`set…` context accessors (decision 2026-10-25). Reason: toasts are triggered outside components ([services/sync/sync.ts](../../src/lib/services/sync/sync.ts) on sync errors) and after `await`s in callbacks, where `getContext` isn't available. Write this reason as a short comment at the top of each service file. Export the classes too, so unit tests can create fresh instances.
   - `modal.svelte.ts`: `ModalServiceInterface`, `class ModalService`, `export const modal = new ModalService()`. Methods: `confirm({ title, body, confirmLabel?, cancelLabel?, dangerous? }): Promise<boolean>`, `open<TResult>(component, props): Promise<TResult | undefined>` for custom modal components, `close()`. Internally a queue of pending modals.
   - `toast.svelte.ts`: `ToastServiceInterface`, `class ToastService`, `export const toast = new ToastService()`. Methods: `toast.info(message, options?)` and `toast.error(message, options?)`, both returning a `ToastId`; `toast.dismiss(id)`. `options`: `{ timeout?: number; persistent?: boolean; action?: { label: string; onClick: () => void | Promise<void> }; onClose?: () => void }`. This covers every use today (`autohide: false` → `persistent`, `callback` with `status: 'closed'` → `onClose`, `toastStore.close(id)` → `toast.dismiss(id)`). The variant classes (`variant-filled-primary` / `variant-filled-error`) move into `ToastHost`.
   - `drawer.svelte.ts`: `DrawerServiceInterface`, `class DrawerService`, `export const drawer = new DrawerService()`. `drawer.open(id: 'app-menu')`, `drawer.close()`, `readonly current: 'app-menu' | undefined`.
   - Replace and delete the existing helpers [src/lib/shared/ui/toast.ts](../../src/lib/shared/ui/toast.ts) (`ToastHelper`, incl. `EnableGlobalMessages`' `toastHelper.init`) and [src/lib/shared/ui/modal.ts](../../src/lib/shared/ui/modal.ts) (`ModalHelper`: `triggerConfirm` → `modal.confirm`, `triggerModal` → `modal.open`).
2. **Host components** in `src/lib/components/ui/`: `ModalHost.svelte`, `ToastHost.svelte`, `DrawerHost.svelte`. They are mounted once in [AppLayout.svelte](../../src/lib/components/shared/app/AppLayout.svelte) and replace `<Modal />`, `<Toast />`, `<Drawer>`. In phase 1 each host calls `initializeStores()` / `getModalStore()` etc. and translates service state into v2 store calls (and results back to the promise). The modal footer styling for `dangerous` (now global CSS in [src/app.scss](../../src/app.scss) under `.modal.dangerous`) moves into `ModalHost`.
3. **Popover** `src/lib/components/ui/Popover.svelte`: `trigger` and `content` snippets, `placement`, `open` (bindable), close on outside click/Escape. Internally uses the v2 `popup` action + `storePopup` (moved out of AppLayout into the component or ModalHost setup). Replace `use:popup` in [Method.svelte](../../src/lib/components/journal/detail/Method.svelte), [CoffeeType.svelte](../../src/lib/components/journal/detail/CoffeeType.svelte), [PageSearch.svelte](../../src/lib/components/shared/elements/page/PageSearch.svelte).
4. **Migrate all call sites** (`grep -rlE "getModalStore|getToastStore|getDrawerStore|ModalSettings|ToastSettings|DrawerSettings|ModalComponent|PopupSettings" src`), including the types-only imports in `src/lib/**/*.ts`. Custom modal components (registered as `ModalComponent`) receive props and a `close(result)` callback from `modal.open` instead of reading `$modalStore[0]`. E.g. [NextcloudLoginModal.svelte](../../src/lib/components/settings/sections/NextcloudLoginModal.svelte) gets `close: (result: boolean) => void` as a prop and calls `close(true)` / `close(false)`; [Nextcloud.svelte](../../src/lib/components/settings/sections/Nextcloud.svelte) does `const confirmed = await modal.open<boolean>(NextcloudLoginModal, { loginUrl })`. Backdrop/Escape resolves `undefined`.
5. Update [EnableGlobalMessages.svelte](../../src/lib/components/shared/app/EnableGlobalMessages.svelte) (drop `toastHelper.init`; remove the component if nothing else is left in it) and [EnableUpdateListener.svelte](../../src/lib/components/shared/app/EnableUpdateListener.svelte) (persistent update toast via `toast.info(..., { persistent: true, action })`).

## Acceptance criteria

- [ ] Outside `src/lib/components/ui/` and `src/lib/services/ui/`, `grep -rnE "getModalStore|getToastStore|getDrawerStore|initializeStores|storePopup|use:popup|ModalSettings|ToastSettings|DrawerSettings|PopupSettings|ModalComponent" src` returns nothing.
- [ ] Modal, toast, drawer and popup e2e tests from story 02 are green, unchanged except for test ids that moved into hosts.
- [ ] Given a `modal.confirm()` is open, when the user presses Escape or clicks the backdrop, then the promise resolves `false`.
- [ ] Given two `modal.confirm()` calls in a row, then they are shown one after another and each promise resolves with its own answer.
- [ ] Given the "Did you click to fast?" toast, when it closes (timeout, dismiss or Undo), then `onClose` runs once and a sync is scheduled, as today.
- [ ] Given a persistent toast, when its page is destroyed, then `toast.dismiss(id)` removes it.
- [ ] `src/lib/shared/ui/toast.ts` and `src/lib/shared/ui/modal.ts` are deleted.
- [ ] `pnpm verify:strict` is green.

## Technical notes

- Design the API around phase 2: v4's `Dialog` is a component (fits a host rendering the queue), v4's toaster is `createToaster()` + `<Toast.Group>` (fits `toast.*` functions), v4's drawer is a `Dialog` styled as a drawer, and v4's `Popover` is a component with trigger/content parts (fits the snippet API).
- Keep services free of `svelte/store` and Skeleton imports; only hosts import Skeleton.
- Unit-test the services (queueing, promise resolution) with Vitest without rendering Skeleton.
- Unit tests need the Vitest setup from story 06, step 0 (`sveltekit()` plugin, `jsdom` per file). If 08 is done before 06, do that step here.

## Testing

- Unit tests for `modal.svelte.ts` and `toast.svelte.ts` (queue, promise results, timeouts with fake timers).
- E2e from 02; `pnpm verify:strict`.

## Out of scope

- Combobox popups (10, which builds on `Popover`). Visual redesign (phase 2).
