<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { TEMPERATURE_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredTemperatureUnit } from '$lib/shared/units';
  import { createEventDispatcher } from 'svelte';

  export let waterTemperature: number | undefined;
  export let valid = false;

  const units = TEMPERATURE_UNITS;
  const preferredUnit = getPreferredTemperatureUnit($settingsStore.preferredUnits);
  const errorMessages: { [key: string]: string } = {
    metric: 'water temperature must be greater than 0',
    imperial: 'water temperature must be greater than 32',
  };
  const dispatch = createEventDispatcher();

  let waterTemperatureMeasurement: Measurement = {
    value: waterTemperature,
    unit: preferredUnit,
  };
  let inputTouched = false;

  $: handleWaterTemperatureChange(waterTemperature);
  $: checkValidity(waterTemperature);
  $: dispatch('change', waterTemperatureMeasurement.value);
  $: showError = inputTouched && !valid;
  $: errorMessage = errorMessages[waterTemperatureMeasurement.unit.system];

  function handleWaterTemperatureChange(waterTemperature?: number): void {
    waterTemperatureMeasurement.value = waterTemperature;
  }

  function handleInputBlur(): void {
    inputTouched = true;
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function checkValidity(value?: number | null): void {
    if (typeof value === 'number' && value <= 0) {
      valid = false;
      return;
    }

    valid = true;
  }
</script>

<Label text="Water temperature" error={showError} {errorMessage}>
  <MeasurementInput
    class={showError ? 'input-error' : ''}
    placeholder="Water temperature, e.g. 98°C"
    updateValue={false}
    {units}
    bind:measurement={waterTemperatureMeasurement}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
</Label>
