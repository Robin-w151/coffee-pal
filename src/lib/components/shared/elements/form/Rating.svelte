<script lang="ts">
  import RatingGroup from '$lib/components/shared/ui/RatingGroup.svelte';

  interface Props {
    rating?: number;
  }

  let { rating = $bindable(0) }: Props = $props();

  // Clicking the current rating again clears it.
  function handleValueChange(value: number): void {
    rating = rating === value ? 0 : value;
  }
</script>

<div class="py-2" data-testid="rating" data-value={rating}>
  <RatingGroup value={rating} max={5} onValueChange={handleValueChange} />
</div>
