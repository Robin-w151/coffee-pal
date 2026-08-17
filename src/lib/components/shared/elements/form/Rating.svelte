<script lang="ts">
  import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
  import { faStar } from '@fortawesome/free-solid-svg-icons';
  import { RatingGroup } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    rating?: number;
  }

  let { rating = $bindable(0) }: Props = $props();

  const MAX_RATING = 5;

  function handleValueChange(details: { value: number }): void {
    // Selecting the current rating again clears it, as it did before.
    rating = rating === details.value ? 0 : details.value;
  }
</script>

<div class="py-2">
  <RatingGroup
    count={MAX_RATING}
    value={rating}
    onValueChange={handleValueChange}
    class="text-tertiary-600-400"
  >
    <RatingGroup.Control>
      {#each { length: MAX_RATING } as _, index (index)}
        <RatingGroup.Item index={index + 1}>
          {#snippet empty()}
            <Icon data={faStarRegular} scale={2} />
          {/snippet}
          {#snippet full()}
            <Icon data={faStar} scale={2} />
          {/snippet}
        </RatingGroup.Item>
      {/each}
    </RatingGroup.Control>
    <RatingGroup.HiddenInput />
  </RatingGroup>
</div>
