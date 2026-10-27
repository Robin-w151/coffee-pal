<script lang="ts">
  // Maps to Skeleton v4/v5 `TagsInput`. Phase 1: wraps v2 `InputChip`, which rejects duplicates.
  import { TagsInput } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    value?: Array<string>;
    name: string;
    placeholder: string;
    /** Colours per tag, applied to each rendered tag. */
    tagColors?: (tag: string) => { color: string; backgroundColor: string };
  }

  let { value = $bindable(), name, placeholder, tagColors }: Props = $props();

  let root = $state<HTMLDivElement>();

  // v2 renders the tags itself, so the colours are applied to its markup.
  $effect(() => {
    const tags = value ?? [];
    if (!root || !tagColors) {
      return;
    }

    for (const tagElement of root.querySelectorAll<HTMLButtonElement>('button.chip')) {
      const tag = tagElement.querySelector('span')?.textContent ?? '';
      if (tags.includes(tag)) {
        applyColors(tagElement, tagColors(tag));
      }
    }
  });

  // v2 tags transition all properties, so a new tag would fade from the theme colour to its own.
  // The colours are applied with transitions off and committed by a layout read.
  function applyColors(
    tagElement: HTMLElement,
    { color, backgroundColor }: { color: string; backgroundColor: string },
  ): void {
    if (tagElement.style.backgroundColor === backgroundColor && tagElement.style.color === color) {
      return;
    }

    tagElement.style.transition = 'none';
    tagElement.style.color = color;
    tagElement.style.backgroundColor = backgroundColor;
    tagElement.getBoundingClientRect(); // commits the colours before transitions come back
    tagElement.style.transition = '';
  }

  // Escape belongs to the input while it's focused (e.g. not to the page's back handling).
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={root} onkeydown={handleKeydown}>
  <TagsInput
    {name}
    {placeholder}
    padding="px-3 py-2"
    regionInput="focus:outline-hidden!"
    bind:value={
      () => value ?? [],
      // v2 mutates the array in place and assigns it back; a copy makes the change visible
      // (e.g. to the colour effect) even when the array isn't reactive state.
      (tags) => (value = [...tags])
    }
  />
</div>
