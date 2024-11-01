<script lang="ts">
  import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
  import { Ratings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  interface Props {
    rating?: number;
  }

  let { rating = $bindable(0) }: Props = $props();

  function handleRatingChange({ detail }: CustomEvent<{ index: number }>): void {
    rating = rating === detail.index ? 0 : detail.index;
  }
</script>

<div class="py-2">
  <Ratings
    value={rating}
    max={5}
    interactive
    justify="justify-start"
    text="text-tertiary-600-300-token"
    on:icon={handleRatingChange}
  >
    {#snippet empty()}
      <Icon data={faStarRegular} scale={2} />
    {/snippet}
    {#snippet full()}
      <Icon data={faStar} scale={2} />
    {/snippet}
  </Ratings>
</div>
