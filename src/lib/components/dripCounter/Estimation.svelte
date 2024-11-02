<script lang="ts">
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { round } from '$lib/shared/math';
  import { clsx } from '$lib/shared/ui/clsx';
  import { getPreferredWeightUnit } from '$lib/shared/units';
  import Card from '../shared/elements/Card.svelte';
  import Form from '../shared/elements/form/Form.svelte';
  import Label from '../shared/elements/form/Label.svelte';
  import MeasurementInput from '../shared/elements/form/MeasurementInput.svelte';

  interface Props {
    dropsPerMinute: number;
    isWithinRange?: boolean;
  }

  let { dropsPerMinute, isWithinRange = $bindable(false) }: Props = $props();

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

  let waterMeasurement: Measurement = $state({
    value: 500,
    unit: preferredUnit,
  });
  let targetDropsPerMinute = $state(60);
  let targetTime = $derived(calculateTime(waterMeasurement.value, targetDropsPerMinute));
  let estimatedTime = $derived(calculateTime(waterMeasurement.value, dropsPerMinute));
  let estimatedTimeVariantClass = $derived(
    clsx(
      !dropsPerMinute && 'variant-soft-tertiary',
      dropsPerMinute && isWithinRange && 'variant-filled-primary',
      dropsPerMinute && !isWithinRange && 'variant-filled-warning',
    ),
  );

  $effect(() => {
    isWithinRange = Math.abs(dropsPerMinute - targetDropsPerMinute) < targetDropsPerMinute * 0.1;
  });

  function calculateTime(
    water?: number | null,
    dropsPerMinute?: number | null,
  ): number | undefined {
    if (water == null || !dropsPerMinute) {
      return;
    }

    return round(water / (dropsPerMinute * 0.05), 0);
  }

  function formatTime(timeInMinutes?: number): string {
    if (timeInMinutes == null) {
      return 'Unknown';
    }

    const timeInHours = Math.floor(timeInMinutes / 60);
    const restTimeInMinutes = timeInMinutes % 60;

    return `${timeInHours ? `${timeInHours}h` : ''} ${restTimeInMinutes}m`;
  }
</script>

<Card class="@container">
  <h3 class="h3">Estimation</h3>
  <div class="flex flex-col @md:flex-row justify-between gap-4">
    <span class="badge {estimatedTimeVariantClass} px-4 py-2 text-base"
      >Estimated time: {formatTime(estimatedTime)}</span
    >
    <span class="badge variant-soft-primary px-4 py-2 text-base"
      >Target time: {formatTime(targetTime)}</span
    >
  </div>
  <Form>
    <Label text="Amount of water">
      <MeasurementInput {units} bind:measurement={waterMeasurement} />
    </Label>
    <Label text="Target drip rate">
      <div class="input-group input-group-divider measurement-input grid-cols-[1fr_auto]">
        <input
          type="number"
          placeholder="Target drip rate, e.g. 60dpm"
          bind:value={targetDropsPerMinute}
        />
        <div class="input-group-shim">dpm</div>
      </div>
    </Label>
  </Form>
</Card>
