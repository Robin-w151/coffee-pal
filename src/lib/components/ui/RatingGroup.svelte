<script lang="ts">
  // Maps to Skeleton v4/v5 `RatingGroup`. Phase 1: wraps v2 `Ratings`.
  import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
  import { Ratings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  interface Props {
    value: number;
    max: number;
    /** Called with the clicked star (1-based). */
    onValueChange: (value: number) => void;
  }

  let { value, max, onValueChange }: Props = $props();
</script>

<Ratings
  {value}
  {max}
  interactive
  justify="justify-start"
  text="text-tertiary-600-300-token"
  on:icon={({ detail }: CustomEvent<{ index: number }>) => onValueChange(detail.index)}
>
  {#snippet empty()}
    <Icon data={faStarRegular} scale={2} />
  {/snippet}
  {#snippet full()}
    <Icon data={faStar} scale={2} />
  {/snippet}
</Ratings>
