<script lang="ts">
  import Journal from '$lib/components/journal/Journal.svelte';
  import PageCard from '$lib/components/ui/elements/PageCard.svelte';
</script>

<svelte:head>
  <title>Coffee Pal - Journal</title>
</svelte:head>

<h2 class="h2">Brewing Journal</h2>
<PageCard class="mb-24">
  <Journal />
</PageCard>
