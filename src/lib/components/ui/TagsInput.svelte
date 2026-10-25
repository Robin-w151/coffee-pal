<script lang="ts">
  // Maps to Skeleton v4/v5 `TagsInput`. Phase 1: wraps v2 `InputChip`, which rejects duplicates.
  import { InputChip } from '@skeletonlabs/skeleton';

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
        const { color, backgroundColor } = tagColors(tag);
        tagElement.style.color = color;
        tagElement.style.backgroundColor = backgroundColor;
      }
    }
  });

  // Escape belongs to the input while it's focused (e.g. not to the page's back handling).
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div bind:this={root} onkeydown={handleKeydown}>
  <InputChip
    {name}
    {placeholder}
    padding="px-3 py-2"
    regionInput="focus:!outline-none"
    bind:value
  />
</div>
