# 15: Form control wrappers on v4

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** In progress
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

- [ ] None of the six wrappers contains `MIGRATION_PLACEHOLDER`.
- [ ] All form-control e2e tests from story 03 for these components are green, unchanged.
- [ ] No new a11y violations on the affected routes.
- [ ] `pnpm check`, `lint`, `build`, `test:unit` green.
- [ ] The failing-test list in PROGRESS.md (from story 13) is updated: the entries for these six wrappers are gone, and no new entries were added.

## Technical notes

- Docs: `https://v4.skeleton.dev/docs/svelte/framework-components/<component>` (e.g. `/switch`, `/segmented-control`, `/slider`, `/rating-group`, `/tags-input`, `/file-upload`). Check component part names (`Switch.Control`, `Switch.Thumb`, …) in v4.15.2.
- Default to Skeleton's styling (new look); add classes only for layout.

## Testing

- Per wrapper, run the specs that cover it: `Switch`, `Slider` → `tests/specs/calculator.spec.ts`; `SegmentedControl`, `FileUpload` → `tests/specs/settings.spec.ts`; `RatingGroup` → `journal.spec.ts` and `myCoffees.spec.ts`; `TagsInput` → `myCoffees.spec.ts` (e.g. `pnpm test:e2e:local tests/specs/calculator.spec.ts`). Test titles describe behaviour, so `--grep "<component>"` would match nothing. At the end, run the full `pnpm verify` if 16 is done too; otherwise only these specs.

## Out of scope

- Overlays, lists, navigation (16).
