<script lang="ts">
  import MyCoffees from '$lib/components/my-coffees/MyCoffees.svelte';
  import PageCard from '$lib/components/ui/elements/PageCard.svelte';
</script>

<svelte:head>
  <title>Coffee Pal - My Coffees</title>
</svelte:head>

<h2 class="h2">My Coffees</h2>
<PageCard class="page-with-actions-token">
  <MyCoffees />
</PageCard>
