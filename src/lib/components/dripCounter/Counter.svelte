<script lang="ts">
  import { DRIP_INSTANTS_COUNT } from '$lib/config/dripCounter';
  import { calculateDripRate } from '$lib/services/dripCounter/dripRate';
  import Card from '../shared/elements/Card.svelte';

  interface Props {
    dropsPerMinute?: number;
    isWithinRange?: boolean;
  }

  let { dropsPerMinute = $bindable(0), isWithinRange = false }: Props = $props();

  let timestamps: Array<number> = $state([]);

  $effect(() => {
    dropsPerMinute = calculateDripRate(timestamps);
  });

  function handleCountClick(): void {
    timestamps = [...timestamps.slice(-DRIP_INSTANTS_COUNT), performance.now()];
  }

  function handleResetClick(): void {
    timestamps = [];
  }
</script>

<Card class="@container">
  <h3 class="h3">Counter</h3>
  <div class="flex flex-1 flex-col gap-4">
    <span
      class={[
        'badge',
        '@md:self-start px-4 py-2 text-base',
        !dropsPerMinute && 'variant-soft-tertiary',
        dropsPerMinute && isWithinRange && 'variant-filled-primary',
        dropsPerMinute && !isWithinRange && 'variant-filled-warning',
      ]}
    >
      {#if timestamps.length > 0}
        {dropsPerMinute} drops/min
      {:else}
        Tap to start counting
      {/if}
    </span>
    <div class="flex flex-1 flex-row-reverse justify-center items-end gap-4">
      <button
        class="btn btn-xl variant-filled-primary w-40 @md:w-64 max-w-full aspect-square rounded-full"
        title="Tap to count drop rate"
        onclick={handleCountClick}>Tap</button
      >
      <button
        class="btn variant-filled-secondary w-20 @md:w-32 max-w-full aspect-square rounded-full"
        title="Reset counter"
        onclick={handleResetClick}>Reset</button
      >
    </div>
  </div>
</Card>
