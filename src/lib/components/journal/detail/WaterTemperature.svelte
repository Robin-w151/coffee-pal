<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { TEMPERATURE_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredTemperatureUnit } from '$lib/shared/units';
  import { untrack } from 'svelte';

  interface Props {
    waterTemperature?: number;
    valid?: boolean;
    onChange?: (waterTemperature?: number) => void;
  }

  let { waterTemperature, valid = $bindable(false), onChange }: Props = $props();

  const units = TEMPERATURE_UNITS;
  const preferredUnit = getPreferredTemperatureUnit($settingsStore.preferredUnits);
  const errorMessages: { [key: string]: string } = {
    metric: 'water temperature must be greater than 0',
    imperial: 'water temperature must be greater than 32',
  };

  let waterTemperatureMeasurement: Measurement = $state({
    value: waterTemperature,
    unit: preferredUnit,
  });
  let inputTouched = $state(false);
  let showError = $derived(inputTouched && !valid);
  let errorMessage = $derived(errorMessages[waterTemperatureMeasurement.unit.system]);

  $effect(() => {
    handleWaterTemperatureChange(waterTemperature);
    checkValidity(waterTemperature);
  });

  $effect(() => {
    onChange?.(waterTemperatureMeasurement.value);
  });

  function handleWaterTemperatureChange(waterTemperature?: number): void {
    untrack(() => {
      waterTemperatureMeasurement.value = waterTemperature;
    });
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
    {units}
    bind:measurement={waterTemperatureMeasurement}
    onblur={handleInputBlur}
    onkeydown={handleInputKeydown}
  />
</Label>
