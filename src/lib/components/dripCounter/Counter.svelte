<script lang="ts">
  import { DRIP_INSTANTS_COUNT } from '$lib/config/dripCounter';
  import { calculateDripRate } from '$lib/services/dripCounter/dripRate';
  import { clsx } from '$lib/shared/ui/clsx';
  import Card from '../shared/elements/Card.svelte';

  export let dropsPerMinute = 0;
  export let isWithinRange = false;

  let timestamps: Array<number> = [];

  $: dropsPerMinute = calculateDripRate(timestamps);
  $: dropsPerMinuteVariantClass = clsx(
    !dropsPerMinute && 'variant-soft-tertiary',
    dropsPerMinute && isWithinRange && 'variant-filled-primary',
    dropsPerMinute && !isWithinRange && 'variant-filled-warning',
  );

  function handleCountClick(): void {
    timestamps = [...timestamps.slice(-DRIP_INSTANTS_COUNT), performance.now()];
  }

  function handleResetClick(): void {
    timestamps = [];
  }
</script>

<Card class="@container">
  <h3 class="h3">Counter</h3>
  <div class="flex flex-col gap-4">
    <span class="badge {dropsPerMinuteVariantClass} @md:self-start px-4 py-2 text-base">
      {#if timestamps.length > 0}
        {dropsPerMinute} drops/min
      {:else}
        Tap to start counting
      {/if}
    </span>
    <div
      class="flex flex-col @md:flex-row-reverse items-center @md:justify-center @md:items-end gap-4"
    >
      <button
        class="btn btn-xl variant-filled-primary w-64 max-w-full aspect-square rounded-full"
        title="Tap to count drop rate"
        on:click={handleCountClick}>Tap</button
      >
      <button
        class="btn variant-filled-secondary w-24 max-w-full aspect-square rounded-full"
        title="Reset counter"
        on:click={handleResetClick}>Reset</button
      >
    </div>
  </div>
</Card>
