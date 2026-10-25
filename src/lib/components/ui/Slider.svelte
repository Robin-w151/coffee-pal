<script lang="ts">
  // Maps to Skeleton v4/v5 `Slider`. Phase 1: wraps v2 `RangeSlider`.
  import { RangeSlider } from '@skeletonlabs/skeleton';
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

<RangeSlider {name} {min} {max} accent="range-slider-accent-token" bind:value>
  {@render children?.()}
</RangeSlider>
