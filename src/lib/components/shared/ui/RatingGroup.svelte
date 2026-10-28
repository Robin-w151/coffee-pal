<script lang="ts">
  // Maps to Skeleton v4/v5 `RatingGroup`.
  import { RatingGroup } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    value: number;
    max: number;
    /** Called with the clicked star (1-based), also when it is the current value. */
    onValueChange: (value: number) => void;
  }

  let { value, max, onValueChange }: Props = $props();

  // v4 reports changes only, so a click on the current star is reported here.
  function handleItemClick(index: number): void {
    if (index === value) {
      onValueChange(index);
    }
  }
</script>

<RatingGroup count={max} {value} onValueChange={(details) => onValueChange(details.value)}>
  <!-- v2's 2x star icons: a touch target of 2rem. -->
  <RatingGroup.Control class="[&_svg]:size-8">
    {#each { length: max }, i (i)}
      <RatingGroup.Item index={i + 1} onclick={() => handleItemClick(i + 1)} />
    {/each}
  </RatingGroup.Control>
  <RatingGroup.HiddenInput />
</RatingGroup>
