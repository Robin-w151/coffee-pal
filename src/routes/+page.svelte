<script lang="ts">
  import Calculator from '$lib/components/calculator/Calculator.svelte';
</script>

<svelte:head>
  <title>Coffee Pal</title>
</svelte:head>

<div class="flex flex-col gap-4 items-center">
  <h2 class="h2">Calculator</h2>
  <div class="card p-4 max-w-screen-md">
    <Calculator />
  </div>
</div>
