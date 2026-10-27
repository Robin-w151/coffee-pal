<script lang="ts">
  // Maps to Skeleton v4/v5 `Slider`. Phase 2: a native range input until story 15.
  import type { Snippet } from 'svelte';

  interface Props {
    value: number;
    min: number;
    max: number;
    name: string;
    /** Header row above the slider, e.g. its label and current value. */
    children?: Snippet;
  }

  let { value = $bindable(), min, max, name, children }: Props = $props();
</script>

<!-- MIGRATION_PLACEHOLDER: Slider -->
<label class="flex flex-col gap-2">
  {@render children?.()}
  <input type="range" class="w-full" {name} {min} {max} bind:value />
</label>
