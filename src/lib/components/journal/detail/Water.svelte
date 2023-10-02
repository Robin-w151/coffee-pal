<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/ui/elements/form/MeasurementInput.svelte';
  import { UNIT_GRAM, WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredUnit } from '$lib/utils/units';

  export let water: number | undefined;
  export let valid = false;

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredUnit(units, $settingsStore.preferredUnits) ?? UNIT_GRAM;
  const errorMessages = {
    required: 'amount of water is required',
    negative: 'amount of water must be greater than 0',
  };

  let waterMeasurement: Measurement = {
    value: water,
    unit: preferredUnit,
  };
  let errorMessage: string | undefined;
  let inputTouched = false;

  $: water = waterMeasurement.value;
  $: checkValidity(water);
  $: showError = inputTouched && !valid;

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
    if (typeof value !== 'number') {
      valid = false;
      errorMessage = errorMessages.required;
      return;
    }

    if (value <= 0) {
      valid = false;
      errorMessage = errorMessages.negative;
      return;
    }

    valid = true;
    errorMessage = undefined;
  }
</script>

<Label text="Amount of water *" error={showError} {errorMessage}>
  <MeasurementInput
    class={showError ? 'input-error' : ''}
    placeholder="Amount of water, e.g. 200"
    {units}
    bind:measurement={waterMeasurement}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
</Label>
