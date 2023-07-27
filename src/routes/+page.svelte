<script lang="ts">
  import Calculator from '$lib/components/calculator/Calculator.svelte';
  import PageCard from '$lib/components/ui/elements/PageCard.svelte';
</script>

<svelte:head>
  <title>Coffee Pal - Calculator</title>
</svelte:head>

<h2 class="h2">Brewing Calculator</h2>
<PageCard>
  <Calculator />
</PageCard>
