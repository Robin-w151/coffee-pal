<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { WEIGHT_UNITS_COFFEE } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredWeightUnit } from '$lib/shared/units';
  import { createEventDispatcher } from 'svelte';

  export let coffee: number | undefined;
  export let valid = false;

  const units = WEIGHT_UNITS_COFFEE;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const errorMessages = {
    required: 'amount of coffee is required',
    negative: 'amount of coffee must be greater than 0',
  };
  const dispatch = createEventDispatcher();

  let coffeeMeasurement: Measurement = {
    value: coffee,
    unit: preferredUnit,
  };
  let errorMessage: string | undefined;
  let inputTouched = false;

  $: handleCoffeeChange(coffee);
  $: checkValidity(coffee);
  $: dispatch('change', coffeeMeasurement.value);
  $: showError = inputTouched && !valid;

  function handleCoffeeChange(coffee?: number): void {
    coffeeMeasurement.value = coffee;
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

<Label text="Amount of coffee *" error={showError} {errorMessage}>
  <MeasurementInput
    class={showError ? 'input-error' : ''}
    placeholder="Amount of coffee, e.g. 12"
    {units}
    bind:measurement={coffeeMeasurement}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
</Label>
