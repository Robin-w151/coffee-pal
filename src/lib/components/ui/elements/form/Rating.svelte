<script lang="ts">
  import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
  import { Ratings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  export let rating: number | undefined = 0;

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
    <svelte:fragment slot="empty">
      <Icon data={faStarRegular} scale={2} />
    </svelte:fragment>
    <svelte:fragment slot="full">
      <Icon data={faStar} scale={2} />
    </svelte:fragment>
  </Ratings>
</div>
