<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';
  import Rating from '$lib/components/ui/elements/form/Rating.svelte';

  export let rating: number | undefined = 0;
</script>

<Label text="Rating" preventDefault>
  <Rating bind:rating />
</Label>
