# 15: Form control wrappers on v4

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Done
**Depends on:** 13
**Size:** M — six wrappers with existing v4 equivalents and existing tests; the Zag.js-based API (`onValueChange` with details objects) needs adapting to `$bindable`.

## User story

As a user, I want switches, segmented controls, sliders, ratings, tags and file upload to work as before with the new look.

## Description

Reimplement the internals of the story 09 wrappers with `@skeletonlabs/skeleton-svelte` v4.15.2. **Props stay the same; call sites aren't touched.**

| Wrapper            | v4 component       | Watch out for                                                                                                                                                        |
| ------------------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Switch`           | `Switch`           | label association; `checked` ↔ `onCheckedChange`                                                                                                                     |
| `SegmentedControl` | `SegmentedControl` | `value` ↔ `onValueChange(details)`; keep radio semantics for the tests                                                                                               |
| `Slider`           | `Slider`           | v4 values are arrays (`value: number[]`); the wrapper keeps a single `number`                                                                                        |
| `RatingGroup`      | `RatingGroup`      | `value` ↔ `onValueChange(details)` → the wrapper's `onValueChange(value)`; clicking the current star must still reach the caller (the toggle-off in `Rating.svelte`) |
| `TagsInput`        | `TagsInput`        | duplicates rejected as in v2; `tagColors` applied to each rendered tag; Escape doesn't propagate from the input                                                      |
| `FileUpload`       | `FileUpload`       | `accept`, drag and drop, `onFileChange(details)` → bindable `file`; selected file name shown                                                                         |

One commit per wrapper. After each: run the related e2e tests, check the placeholder count went down, and check the screenshots for that component.

## Acceptance criteria

- [x] None of the six wrappers contains `MIGRATION_PLACEHOLDER`.
- [x] All form-control e2e tests from story 03 for these components are green. Their assertions are unchanged; interactions and page objects were adapted under the phase 2 test rule (see As built).
- [x] No new a11y violations on the affected routes.
- [x] `pnpm check`, `lint`, `build`, `test:unit` green.
- [x] The failing-test list in PROGRESS.md (from story 13) is updated: the entries for these six wrappers are gone, and no new entries were added.

## Technical notes

- Docs: `https://v4.skeleton.dev/docs/svelte/framework-components/<component>` (e.g. `/switch`, `/segmented-control`, `/slider`, `/rating-group`, `/tags-input`, `/file-upload`). Check component part names (`Switch.Control`, `Switch.Thumb`, …) in v4.15.2.
- Default to Skeleton's styling (new look); add classes only for layout.

### As built (2026-10-28)

- **Phase 2 test rule (decision 2026-10-28, also in the epic's Assumptions):** v4 renders native radios, `div[role=slider]` and other Zag markup, so some tests depended on v2 markup. The human chose the following rule: page objects and the interaction lines of test bodies may change; assertions never do. Each change is listed in its commit and below.
- **`Switch`:** `Switch.Control/Thumb/Label/HiddenInput`. The label is `sr-only`. The hidden checkbox gets `role="switch"` and is stretched transparently over the root (`relative` on the root, an inline style on the input). Otherwise the 1px input sits under the control (Playwright: "intercepts pointer events"), or, without a positioned root, somewhere outside it.
- **`SegmentedControl`:** `SegmentedControl.Control/Indicator/Item/ItemText/ItemHiddenInput`. It stays horizontal at every width; v2 stacked the options below `sm`, and the three short options fit. _Test change:_ `SettingsPage.getCheckedRadio` returns the `label` around the checked radio. v4's radios are text-less inputs, so `toHaveText` needs the label.
- **`Slider`:** single value ↔ `[value]`. The header row is `Slider.Label`, which names the thumb (Skeleton's `label-text` style makes it smaller). _Test changes:_ `iceRatioRange` is now the hidden form input (`input[name=ice-ratio]`), so the `toHaveValue('30')` assertion stays. The new `iceRatioThumb` (`role=slider`) takes the keyboard. `fill('25'/'50')` became `setIceRatio()` (Home + ArrowRight). The readiness wait in `states.visual.ts` checks the thumb, because the hidden input is never visible.
- **`RatingGroup`:** Skeleton's SVG stars at `size-8` (v2's 2rem touch target), in Skeleton's colour. Zag reports changes only, so the wrapper reports a click on the current star itself (`Rating.svelte` clears the rating on it). _Test change:_ `getRatingStar` finds role `radio` instead of `button`.
- **`TagsInput`:** duplicates are rejected through `validate`, and tags aren't editable. Each tag is a single `ItemDeleteTrigger` button that holds the tag text and its aroma colours. Clicking it removes the tag, as v2's chips did. Because the colours are inline from the first render, nothing fades in. Its label is "Remove …", since Zag's "Delete tag …" would also match the page's Delete button. _Test changes:_ `addAroma` waits until the input is empty, because Zag clears it a frame after Enter and would wipe text typed in between. The fade-in recorder selects `button`, not v2's `button.chip`. The Escape test waits a frame before `blur()`, because Zag refocuses the input a frame after it gains focus. Neither race can happen at human speed.
- **`FileUpload`:** `useFileUpload` with `FileUpload.Provider` (one file), a `Dropzone` showing the file name and hint, and a `HiddenInput`. Zag can't control its files, so an effect clears them when the caller resets `file` (verified: after an import the dropzone shows its message again, and Import is disabled).
- **E2e:** 121 passed and 6 failed, all of them story 16. The backup import test now gets past the upload and stops at the Pagination placeholder ("Last page"). A11y: no new violations. Placeholders 15 → 9.

## Testing

- Per wrapper, run the specs that cover it: `Switch`, `Slider` → `tests/specs/calculator.spec.ts`; `SegmentedControl`, `FileUpload` → `tests/specs/settings.spec.ts`; `RatingGroup` → `journal.spec.ts` and `myCoffees.spec.ts`; `TagsInput` → `myCoffees.spec.ts` (e.g. `pnpm test:e2e:local tests/specs/calculator.spec.ts`). Test titles describe behaviour, so `--grep "<component>"` would match nothing. At the end, run the full `pnpm verify` if 16 is done too; otherwise only these specs.

## Out of scope

- Overlays, lists, navigation (16).
