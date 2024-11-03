<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredWeightUnit } from '$lib/shared/units';
  import { untrack } from 'svelte';

  interface Props {
    water?: number;
    valid?: boolean;
    onChange?: (water?: number) => void;
  }

  let { water, valid = $bindable(false), onChange }: Props = $props();

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const errorMessages = {
    required: 'amount of water is required',
    negative: 'amount of water must be greater than 0',
  };

  let waterMeasurement: Measurement = $state({
    value: water,
    unit: preferredUnit,
  });
  let errorMessage: string | undefined = $state();
  let inputTouched = $state(false);
  let showError = $derived(inputTouched && !valid);

  $effect(() => {
    handleWaterChange(water);
    checkValidity(water);
  });

  $effect(() => {
    onChange?.(waterMeasurement.value);
  });

  function handleWaterChange(water?: number): void {
    untrack(() => {
      waterMeasurement.value = water;
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

<Label text="Amount of water *" error={showError} {errorMessage}>
  <MeasurementInput
    class={showError ? 'input-error' : ''}
    placeholder="Amount of water, e.g. 200"
    {units}
    bind:measurement={waterMeasurement}
    onblur={handleInputBlur}
    onkeydown={handleInputKeydown}
  />
</Label>
