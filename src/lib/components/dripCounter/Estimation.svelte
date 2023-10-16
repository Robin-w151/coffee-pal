<script lang="ts">
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { round } from '$lib/utils/math';
  import { getPreferredWeightUnit } from '$lib/utils/units';
  import Form from '../ui/elements/form/Form.svelte';
  import Label from '../ui/elements/form/Label.svelte';
  import MeasurementInput from '../ui/elements/form/MeasurementInput.svelte';

  export let dropsPerMinute: number;

  $: totalTimeEstimate = calculateTotalTime(waterMeasurement.value, dropsPerMinute);

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

  let waterMeasurement: Measurement = {
    value: 500,
    unit: preferredUnit,
  };

  function calculateTotalTime(water?: number | null, dropsPerMinute?: number | null): string {
    if (water == null || !dropsPerMinute) {
      return 'Unknown';
    }

    const timeInMinutes = round(water / (dropsPerMinute * 0.05), 0)!;
    const timeInHours = Math.floor(timeInMinutes / 60);
    const restTimeInMinutes = timeInMinutes % 60;

    return `${timeInHours ? `${timeInHours}h` : ''} ${restTimeInMinutes}m`;
  }
</script>

<h3 class="h3">Estimation</h3>
<Form>
  <Label text="Amount of water">
    <MeasurementInput {units} bind:measurement={waterMeasurement} />
  </Label>
  <span>Estimated time: {totalTimeEstimate}</span>
</Form>
