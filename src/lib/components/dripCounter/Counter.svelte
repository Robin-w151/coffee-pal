<script lang="ts">
  import { round } from '$lib/utils/math';
  import Card from '../ui/elements/Card.svelte';

  export let dropsPerMinute = 0;

  let timestamps: Array<number> = [];

  $: calculateDripRate(timestamps);

  function handleCountClick(): void {
    timestamps = [...timestamps.slice(-1), performance.now()];
  }

  function handleResetClick(): void {
    timestamps = [];
  }

  function calculateDripRate(timestamps: Array<number>): void {
    if (timestamps.length < 2) {
      dropsPerMinute = 0;
      return;
    }

    const differences = [];
    for (let i = 0; i < timestamps.length - 1; i++) {
      differences.push(timestamps[i + 1] - timestamps[0]);
    }

    const meanDifference = differences.reduce((d1, d2) => d1 + d2, 0) / differences.length;
    dropsPerMinute = round(60_000 / meanDifference, 0)!;
  }
</script>

<Card>
  <h3 class="h3">Counter</h3>
  <div class="flex flex-col gap-4">
    {#if timestamps.length > 0}
      <span>{dropsPerMinute} drops/min</span>
    {:else}
      <span>Tap to start counting</span>
    {/if}
    <button
      class="btn btn-xl variant-ghost-primary h-36"
      title="Tap to count drop rate"
      on:click={handleCountClick}>Tap</button
    >
    <button class="btn variant-ghost-secondary" title="Reset counter" on:click={handleResetClick}
      >Reset</button
    >
  </div>
</Card>
