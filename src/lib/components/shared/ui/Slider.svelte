<script lang="ts">
  // Maps to Skeleton v4/v5 `Slider`. Phase 1: wraps v2 `RangeSlider`.
  import { Slider } from '@skeletonlabs/skeleton-svelte';
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

<Slider {name} {min} {max} accent="accent-primary-500 dark:accent-primary-600" bind:value>
  {@render children?.()}
</Slider>
