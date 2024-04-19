<script lang="ts">
  import { DRIP_INSTANTS_COUNT } from '$lib/config/dripCounter';
  import { calculateDripRate } from '$lib/services/dripCounter/dripRate';
  import { clsx } from '$lib/utils/ui/clsx';
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
    <button
      class="btn btn-xl variant-ghost-primary h-40 @md:h-32"
      title="Tap to count drop rate"
      on:click={handleCountClick}>Tap</button
    >
    <button class="btn variant-ghost-secondary" title="Reset counter" on:click={handleResetClick}
      >Reset</button
    >
  </div>
</Card>
