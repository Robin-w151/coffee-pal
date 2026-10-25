# 06: Persisted state with runed

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 05
**Size:** M — two stores, but ~22 consumer files move from store syntax to runes, and the stored data format must stay compatible.

## User story

As a user, I want my colour scheme, preferred units and WebDAV sync connection to survive the app update, so that I don't have to set them up again.

As Claude: remove `localStorageStore`, which has no replacement in Skeleton v3+.

Branch: `migration/1-decouple` (create from `main` after 05 is merged). Phase 1 gate: `pnpm verify:strict`.

## Description

Replace `localStorageStore` from `@skeletonlabs/skeleton` in [src/lib/stores/settings.ts](../../src/lib/stores/settings.ts) and [src/lib/stores/sync.ts](../../src/lib/stores/sync.ts) with [`PersistedState` from runed](https://runed.dev/docs/utilities/persisted-state) (decision 2026-10-23).

0. **Make Vitest understand runes and SvelteKit modules:** in [vitest.config.ts](../../vitest.config.ts) add `plugins: [sveltekit()]` (from `@sveltejs/kit/vite`; it resolves `$lib` and `$app/*` and compiles `.svelte.ts`) and drop the manual `$lib` alias. Then `pnpm add -D jsdom` and set `// @vitest-environment jsdom` at the top of the specs that need `localStorage` (the existing node-only specs stay on `node`). Story 08 reuses this setup.
1. `pnpm add -D runed` (dev dependency, like everything else in this repo).
2. Rename the modules to `settings.svelte.ts` and `sync.svelte.ts` (runes need the `.svelte.ts` extension outside components).
3. **Same keys, same format:** keys stay `settings` and `sync`. Always pass `serializer: { serialize: JSON.stringify, deserialize: JSON.parse }` explicitly (as `JSON_SERIALIZER` in the class below), so the format is pinned in code.
4. **Keep the sanitising logic** (`sanitizeLocalStorage` in settings) and run it before the `PersistedState` is created. It stays guarded by `browser` from `$app/environment`.
5. **New API: interface + class + context accessors**, following the pattern of [orfarchiv-ui `skeleton.svelte.ts`](https://github.com/Robin-w151/orfarchiv-ui/blob/develop/src/lib/stores/runes/skeleton.svelte.ts) (decision 2026-10-25):
   ```ts
   export interface SettingsStoreInterface {
     readonly colorScheme: ColorScheme;
     readonly preferredUnits: MeasurementSystem;
     setColorScheme: (colorScheme: ColorScheme) => void;
     setPreferredUnits: (preferredUnits: MeasurementSystem) => void;
   }

   export class SettingsStore implements SettingsStoreInterface {
     private readonly state: PersistedState<Settings>;

     readonly colorScheme = $derived(this.state.current.colorScheme);
     readonly preferredUnits = $derived(this.state.current.preferredUnits);

     constructor() {
       sanitizeLocalStorage(); // must run before PersistedState reads the value
       this.state = new PersistedState<Settings>(SETTINGS_KEY, DEFAULT_SETTINGS, {
         serializer: JSON_SERIALIZER,
       });
     }

     setColorScheme = (colorScheme: ColorScheme): void => {
       this.state.current = { ...this.state.current, colorScheme };
     };

     setPreferredUnits = (preferredUnits: MeasurementSystem): void => {
       /* same pattern */
     };
   }

   const DEFAULT_KEY = Symbol('root_settings_store');

   export function getSettingsStore(key: symbol = DEFAULT_KEY): SettingsStoreInterface {
     return getContext(key);
   }

   export function setSettingsStore(key: symbol = DEFAULT_KEY): SettingsStoreInterface {
     const settingsStore = new SettingsStore();
     return setContext(key, settingsStore);
   }
   ```
   - Same shape for sync in `sync.svelte.ts`: `SyncStoreInterface` (`readonly connection: Connection | undefined`, `setConnection`, `removeConnection`, `updateLastSync`), `SyncStore`, `getSyncStore` / `setSyncStore` with `Symbol('root_sync_store')`.
   - Methods are arrow-function fields (so they can be passed around unbound), state changes reassign whole objects (don't mutate nested fields), as the runed docs recommend.
   - Export the classes too, so unit tests can instantiate them without a component context.
   - **Where the stores are created:** call `setSettingsStore()` and `setSyncStore()` at the top of [AppLayout.svelte](../../src/lib/components/shared/app/AppLayout.svelte)'s script (it wraps every route) and use the returned instances there (AppLayout itself reads the sync store). Context is per component tree, so on the server each request gets fresh instances instead of shared module state.
6. **Update all consumers** (`grep -rlE "settingsStore|syncStore" src`, ~22 files):
   - Components: `const settingsStore = getSettingsStore();` during component init, then `$settingsStore.preferredUnits` → `settingsStore.preferredUnits`, `settingsStore.setColorScheme(...)` stays the same call. Same for the sync store (`$syncStore.connection` → `syncStore.connection`). Existing `$effect`s (e.g. [EnableColorSchemes.svelte](../../src/lib/components/shared/app/EnableColorSchemes.svelte)) stay; don't add `$effect.root`.
   - **[syncAvailability.svelte.ts](../../src/lib/stores/syncAvailability.svelte.ts)** (today a module-level `derived([online, syncStore], …)`): convert it to the same pattern: `SyncAvailabilityStore` with `readonly isAvailable = $derived(...)`, built from the sync store passed to its constructor and `fromStore(onlineStore())` (as in orfarchiv-ui's `effectiveColorScheme.svelte.ts`); `setSyncAvailabilityStore(syncStore)` in AppLayout after `setSyncStore()`, `getSyncAvailabilityStore()` in [Journal.svelte](../../src/lib/components/journal/Journal.svelte), [MyCoffees.svelte](../../src/lib/components/myCoffees/MyCoffees.svelte) and [Nextcloud.svelte](../../src/lib/components/settings/sections/Nextcloud.svelte).
   - **[services/sync/sync.ts](../../src/lib/services/sync/sync.ts)** runs outside components (the scheduled task from `setupScheduledTask(SYNC, sync)` fires from timers), so it can't call `getContext`. Pass the store in explicitly: `sync(syncStore: SyncStoreInterface)` reads `syncStore.connection` and calls `syncStore.updateLastSync()`; the components that call `sync()` ([Journal.svelte](../../src/lib/components/journal/Journal.svelte), [MyCoffees.svelte](../../src/lib/components/myCoffees/MyCoffees.svelte), [Nextcloud.svelte](../../src/lib/components/settings/sections/Nextcloud.svelte)) pass their `getSyncStore()` instance. For the scheduled task, AppLayout (which already calls `scheduleSync`) registers the instance once via a new `initScheduledSync(syncStore)` that the task closure uses. Keep `scheduleSync`/`pauseScheduledSync`/`resumeScheduledSync` signatures unchanged for their other callers.
   - Keep behaviour identical.
7. SSR: AppLayout also renders on the server (`/` is prerendered via [src/routes/+page.ts](../../src/routes/+page.ts); other routes are server-rendered on Vercel), so the store constructors run there per request. Confirm `PersistedState` doesn't touch `localStorage` without `window`; if it does, skip `sanitizeLocalStorage()` and the storage access when `!browser` and fall back to the defaults. `pnpm build` (prerender) must not log storage errors.

## Acceptance criteria

- [x] `pnpm migration:status` shows `local-storage-store` = 0.
- [x] Given localStorage contains `settings` / `sync` values in the legacy v2 format (fixture from story 02), when the app loads, then the colour scheme, units and sync connection are applied (e2e "legacy data format" test is green, unchanged).
- [x] Given an invalid `settings` value (e.g. `{"colorScheme":"pink"}` or invalid JSON), when the app loads, then it falls back to `system`/`metric` like today.
- [x] Given a user changes a setting, when the page reloads, then the change persists, and `localStorage.settings` contains plain JSON with the same shape as before.
- [x] Given `localStorage.settings` has `colorScheme: 'dark'`, when the page loads, then `<html>` has the `dark` class before hydration (the inline script in `app.html` still reads the format). Covered by an e2e check that reads `document.documentElement.className` in an `addInitScript`-seeded page before `data-test="ready"` is set.
- [x] `pnpm verify:strict` is green (no visual change).

## Technical notes

- Files: [src/lib/stores/settings.ts](../../src/lib/stores/settings.ts), [src/lib/stores/sync.ts](../../src/lib/stores/sync.ts), [src/lib/models/settings.ts](../../src/lib/models/settings.ts) (unchanged), [src/lib/models/sync.ts](../../src/lib/models/sync.ts) (unchanged), [src/app.html](../../src/app.html) (inline script must keep working unchanged), [vitest.config.ts](../../vitest.config.ts), consumers across `src/lib/components`, `src/lib/services/sync`, `src/routes`.
- Store pattern reference: [orfarchiv-ui `src/lib/stores/runes/`](https://github.com/Robin-w151/orfarchiv-ui/tree/develop/src/lib/stores/runes) (`skeleton.svelte.ts`, `effectiveColorScheme.svelte.ts`). The existing `app.svelte.ts` and `syncState.svelte.ts` in this repo use an older closure style; they stay as they are (out of scope).
- Also touched: [syncAvailability.svelte.ts](../../src/lib/stores/syncAvailability.svelte.ts), [AppLayout.svelte](../../src/lib/components/shared/app/AppLayout.svelte) (creates the stores).
- `syncTabs` stays at its default `true` (see epic assumptions).

### As built (2026-10-25)

- `runed` 0.38.0 and `jsdom` 30.1.3 as dev dependencies. `JSON_SERIALIZER` lives in [src/lib/stores/persisted.ts](../../src/lib/stores/persisted.ts) and is shared by both stores.
- **Getters instead of `$derived` fields** (`colorScheme`, `preferredUnits`, `connection`, `isAvailable`). `PersistedState.current` already re-reads storage on every access and tracks it inside effects, so a `$derived` would only add a cache that callers outside effects (the timer-driven scheduled sync) could see stale. A `$derived` field reading a constructor-assigned field also fails `svelte-check` (TS2729).
- **Setters run fully inside `untrack`** (`private update(updater)`). Appearance and Units call the setters from an `$effect`. The value `PersistedState` returns is a proxy whose get traps subscribe the running effect, even when it's only spread (`{ ...settings }`). Untracking just the read still loops (`effect_update_depth_exceeded`), so the whole read-update-write is untracked. A unit test covers this.
- **Vitest** also needs `resolve.conditions: ['browser']`. Without it `esm-env` reports "not a browser", so runed runs without a window and `$app/environment`'s `browser` is `false`.
- The settings unit spec is `settings.svelte.spec.ts`, so it can use `$effect.root`. The sync spec stays `sync.spec.ts`.
- **Small behaviour difference:** `PersistedState` writes the default value when the key is missing (`settings` → `{"colorScheme":"system","preferredUnits":"metric"}`, `sync` → `{}`). Skeleton's store only wrote on change. The format is the same, and `app.html` treats `system` like a missing value.
- SSR: runed's `defaultWindow` is `undefined` on the server, so no storage is touched there. `pnpm build` (prerender) logs no storage errors.
- New e2e tests in [appShell.spec.ts](../../tests/specs/appShell.spec.ts): an invalid `settings` value (unknown colour scheme, invalid JSON) falls back to the defaults, and the stored `dark` scheme is applied before hydration. A `MutationObserver` init script records `<html>` as soon as `<body>` exists.

## Testing

- Unit tests (Vitest, jsdom via the per-file environment comment from step 0) that instantiate `SettingsStore` and `SyncStore` directly: a legacy value is read; invalid values are sanitised; writes produce the same JSON as `localStorageStore` did (compare with a hard-coded legacy string).
- E2e tests from 02 (colour scheme persistence, sync connection, legacy format) stay unchanged and green.

## Out of scope

- Dexie/IndexedDB data (unchanged by this epic).
