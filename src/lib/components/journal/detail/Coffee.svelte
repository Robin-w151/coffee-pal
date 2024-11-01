<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { WEIGHT_UNITS_COFFEE } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredWeightUnit } from '$lib/shared/units';
  import { untrack } from 'svelte';

  interface Props {
    coffee: number | undefined;
    valid?: boolean;
    onChange: (coffee: number) => void;
  }

  let { coffee, valid = $bindable(false), onChange }: Props = $props();

  const units = WEIGHT_UNITS_COFFEE;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const errorMessages = {
    required: 'amount of coffee is required',
    negative: 'amount of coffee must be greater than 0',
  };

  let coffeeMeasurement: Measurement = $state({
    value: coffee,
    unit: preferredUnit,
  });
  let errorMessage: string | undefined = $state();
  let inputTouched = $state(false);
  let showError = $derived(inputTouched && !valid);

  $effect(() => {
    handleCoffeeChange(coffee);
    checkValidity(coffee);
  });

  $effect(() => {
    if (coffeeMeasurement.value !== undefined) {
      onChange(coffeeMeasurement.value);
    }
  });

  function handleCoffeeChange(coffee?: number): void {
    untrack(() => {
      coffeeMeasurement.value = coffee;
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
    onblur={handleInputBlur}
    onkeydown={handleInputKeydown}
  />
</Label>
