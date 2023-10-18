<script lang="ts">
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { round } from '$lib/utils/math';
  import { getPreferredWeightUnit } from '$lib/utils/units';
  import Card from '../ui/elements/Card.svelte';
  import Form from '../ui/elements/form/Form.svelte';
  import Label from '../ui/elements/form/Label.svelte';
  import MeasurementInput from '../ui/elements/form/MeasurementInput.svelte';

  export let dropsPerMinute: number;

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

  let waterMeasurement: Measurement = {
    value: 500,
    unit: preferredUnit,
  };
  let targetDropsPerMinute = 60;

  $: targetTime = calculateTime(waterMeasurement.value, targetDropsPerMinute);
  $: estimatedTime = calculateTime(waterMeasurement.value, dropsPerMinute);

  function calculateTime(water?: number | null, dropsPerMinute?: number | null): string {
    if (water == null || !dropsPerMinute) {
      return 'Unknown';
    }

    const timeInMinutes = round(water / (dropsPerMinute * 0.05), 0)!;
    const timeInHours = Math.floor(timeInMinutes / 60);
    const restTimeInMinutes = timeInMinutes % 60;

    return `${timeInHours ? `${timeInHours}h` : ''} ${restTimeInMinutes}m`;
  }
</script>

<Card>
  <h3 class="h3">Estimation</h3>
  <Form>
    <Label text="Amount of water">
      <MeasurementInput {units} bind:measurement={waterMeasurement} />
    </Label>
    <Label text="Target drip rate">
      <div class="input-group input-group-divider grid-cols-[1fr_auto]">
        <input
          type="number"
          placeholder="Target drip rate, e.g. 60dpm"
          bind:value={targetDropsPerMinute}
        />
        <div class="input-group-shim">dpm</div>
      </div>
    </Label>
    <span>Target time: {targetTime}</span>
    <span>Estimated time: {estimatedTime}</span>
  </Form>
</Card>
