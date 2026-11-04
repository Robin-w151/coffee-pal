<script lang="ts">
  // Wraps Skeleton's `Slider`. Skeleton works with arrays of values; this wrapper has one thumb.
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
  <!-- The header row labels the thumb, in the size and weight of the other field labels
       (Skeleton's are extra small and medium). -->
  <Slider.Label class="text-base font-normal">{@render children?.()}</Slider.Label>
  <Slider.Control>
    <Slider.Track>
      <Slider.Range />
    </Slider.Track>
    <Slider.Thumb index={0}>
      <Slider.HiddenInput />
    </Slider.Thumb>
  </Slider.Control>
</Slider>
