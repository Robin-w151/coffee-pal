# 09: Form control wrappers

**Epic:** [0001 Migrate to Skeleton v5, Tailwind v4 and SvelteKit 3](README.md)
**Owner:** Claude
**Status:** Todo
**Depends on:** 05
**Size:** M — six small wrappers following one pattern, plus updating their call sites; FileUpload has some event-handling detail.

## User story

As Claude, I want the simple form controls behind app-owned wrapper components named after their v4/v5 successors, so that phase 2 swaps one file per control.

## Description

Create in `src/lib/components/ui/`:

| Wrapper                   | Wraps (v2)               | v4/v5 target       | App-shaped props                                                                                                                                                                                                                                                                     |
| ------------------------- | ------------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Switch.svelte`           | `SlideToggle`            | `Switch`           | `checked` (bindable), `name`, `label` (accessible name; visible label stays at the call site), `onCheckedChange?(checked)`                                                                                                                                                           |
| `SegmentedControl.svelte` | `RadioGroup`/`RadioItem` | `SegmentedControl` | `value` (bindable), `options: { value, label }[]`, `name`, `label`                                                                                                                                                                                                                   |
| `Slider.svelte`           | `RangeSlider`            | `Slider`           | `value` (bindable), `min`, `max`, `name`, `label`, `children?` snippet (header row, e.g. "Ice Ratio" + value)                                                                                                                                                                        |
| `RatingGroup.svelte`      | `Ratings`                | `RatingGroup`      | `value`, `max`, `label`, `onValueChange(value)`; star icons (svelte-awesome, `scale={2}`) live inside the wrapper. The toggle-off logic stays in the app's [Rating.svelte](../../src/lib/components/shared/elements/form/Rating.svelte), which becomes a thin user of `RatingGroup`. |
| `TagsInput.svelte`        | `InputChip`              | `TagsInput`        | `value: string[]` (bindable), `name`, `placeholder`, `label`, `tagColors?(tag): { color, backgroundColor }` (see below). Duplicates are rejected, as v2 does by default; not configurable.                                                                                           |
| `FileUpload.svelte`       | `FileDropzone`           | `FileUpload`       | `file` (bindable, `File \| undefined`), `name`, `accept`. Renders the upload icon and "Click to select file or drag and drop" / the selected file name itself.                                                                                                                       |

Call sites: `Switch` in [Recipe.svelte](../../src/lib/components/calculator/sections/Recipe.svelte) and [ToggleableSection.svelte](../../src/lib/components/shared/elements/ToggleableSection.svelte) (which needs `onCheckedChange` for its `on:change`); `SegmentedControl` in settings [Appearance](../../src/lib/components/settings/sections/Appearance.svelte) and [Units](../../src/lib/components/settings/sections/Units.svelte); `Slider` in [Iced.svelte](../../src/lib/components/calculator/sections/Iced.svelte); `RatingGroup` in [Rating.svelte](../../src/lib/components/shared/elements/form/Rating.svelte); `TagsInput` in [Aromas.svelte](../../src/lib/components/myCoffees/detail/Aromas.svelte); `FileUpload` in [Backup.svelte](../../src/lib/components/settings/sections/Backup.svelte) (today `bind:files` + `files?.[0]`).

**TagsInput owns two behaviours that `Aromas.svelte` currently does through Skeleton's DOM:** per-tag colours (the caller passes `tagColors={getAromaColor}`, and the wrapper applies them to each tag it renders; no `querySelectorAll('button.chip')` from outside) and stopping Escape from propagating while the input is focused (built into the wrapper). Remove `inputChipRef`, the `$effect` and `installEventHandler` from `Aromas.svelte`. Otherwise both silently break in phase 2, when v4's `TagsInput` renders different markup.

Rules:

- Use Svelte 5 runes and `$bindable`, like the rest of the codebase.
- Only the props the call sites actually need. Look at each usage (`grep -rn "<SlideToggle\|<RadioGroup\|<RangeSlider\|<Ratings\|<InputChip\|<FileDropzone" src`) and don't add speculative options.
- Keep accessible names and app-owned `data-testid`s from stories 02/03 on the wrapper root.
- Classes passed today (e.g. `active="variant-filled-primary"`) move inside the wrapper as defaults; callers don't pass Skeleton classes.
- Replace all call sites.

## Acceptance criteria

- [ ] No file outside `src/lib/components/ui/` imports `SlideToggle`, `RadioGroup`, `RadioItem`, `RangeSlider`, `Ratings`, `InputChip` or `FileDropzone`.
- [ ] No call site passes Skeleton class names to these wrappers.
- [ ] Form control e2e tests from story 03 are green, unchanged.
- [ ] `Aromas.svelte` contains no `querySelector`, `installEventHandler` or chip class names.
- [ ] Given aromas "caramel" and "lemon", when the coffee detail renders, then each tag has the colours from `getAromaColor` (e2e assertion on the tag's computed `background-color`, part of the story 03 InputChip test).
- [ ] Given focus in the tags input, when Escape is pressed, then the event doesn't reach `window` (whatever listened before, e.g. the page's back handling, isn't triggered).
- [ ] `pnpm verify:strict` is green (no visual change).

## Technical notes

- Existing shared form components for style: [src/lib/components/shared/elements/form/](../../src/lib/components/shared/elements/form).
- Each wrapper has a short header comment naming the v4/v5 component it will map to.

## Testing

- E2e from 03; `pnpm verify:strict`.

## Out of scope

- Autocomplete, ListBox, Paginator, rail, app bar (10). Input groups (11 moves styles; 17 and 19 migrate markup).
