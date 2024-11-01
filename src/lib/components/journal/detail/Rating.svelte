<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import Rating from '$lib/components/shared/elements/form/Rating.svelte';

  interface Props {
    rating?: number;
  }

  let { rating = $bindable(0) }: Props = $props();
</script>

<Label text="Rating" preventDefault>
  <Rating bind:rating />
</Label>
