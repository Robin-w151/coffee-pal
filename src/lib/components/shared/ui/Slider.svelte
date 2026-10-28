<script lang="ts">
  // Maps to Skeleton v4/v5 `Slider`. v4 works with arrays of values; this wrapper has one thumb.
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

  function handleValueChange(details: { value: Array<number> }): void {
    value = details.value[0];
  }
</script>

<Slider {name} {min} {max} value={[value]} onValueChange={handleValueChange}>
  <!-- The header row labels the thumb, as v2's label around the range input did. -->
  <Slider.Label>{@render children?.()}</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Range />
    </Slider.Track>
    <Slider.Thumb index={0}>
      <Slider.HiddenInput />
    </Slider.Thumb>
  </Slider.Control>
</Slider>
