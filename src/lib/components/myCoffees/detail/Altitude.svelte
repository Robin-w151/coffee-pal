<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { LENGTH_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredLengthUnit } from '$lib/shared/units';
  import { untrack } from 'svelte';

  interface Props {
    altitude?: number;
    valid?: boolean;
    onChange?: (altitude?: number) => void;
  }

  let { altitude, valid = $bindable(false), onChange }: Props = $props();

  const units = LENGTH_UNITS;
  const preferredUnit = getPreferredLengthUnit($settingsStore.preferredUnits);
  const errorMessage = 'altitude must be greater than or equal to 0';

  let altitudeMeasurement: Measurement = $state({
    value: altitude,
    unit: preferredUnit,
  });
  let inputTouched = $state(false);
  let showError = $derived(inputTouched && !valid);

  $effect(() => {
    handleAltitudeChange(altitude);
    checkValidity(altitude);
  });

  $effect(() => {
    onChange?.(altitudeMeasurement.value);
  });

  function handleAltitudeChange(altitude?: number): void {
    untrack(() => {
      altitudeMeasurement.value = altitude;
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
    if (typeof value === 'number' && value < 0) {
      valid = false;
      return;
    }

    valid = true;
  }
</script>

<Label text="Altitude" error={showError} {errorMessage}>
  <MeasurementInput
    class={showError ? 'input-error' : ''}
    placeholder="Altitude, e.g. 1600m"
    {units}
    bind:measurement={altitudeMeasurement}
    onblur={handleInputBlur}
    onkeydown={handleInputKeydown}
  />
</Label>
