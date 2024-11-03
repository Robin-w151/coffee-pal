<script lang="ts">
  import type { Measurement, Unit } from '$lib/models/measurement';
  import { round } from '$lib/shared/math';
  import { untrack } from 'svelte';
  import type {
    ChangeEventHandler,
    FocusEventHandler,
    KeyboardEventHandler,
  } from 'svelte/elements';

  interface Props {
    measurement: Measurement;
    units: Array<Unit>;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    class?: string;
    onchange?: ChangeEventHandler<HTMLInputElement>;
    onfocus?: FocusEventHandler<HTMLInputElement>;
    onblur?: FocusEventHandler<HTMLInputElement>;
    onkeydown?: KeyboardEventHandler<HTMLInputElement>;
    onkeyup?: KeyboardEventHandler<HTMLInputElement>;
  }

  let {
    measurement = $bindable(),
    units,
    placeholder,
    disabled = false,
    readonly = false,
    class: clazz,
    onchange,
    onfocus,
    onblur,
    onkeydown,
    onkeyup,
  }: Props = $props();

  let value = $state(measurement.unit.conversion.fromBase(measurement.value));
  let previousValue: number | undefined;
  let previousUnit: Unit;

  $effect(() => {
    handleMeasurementChange(measurement);
  });

  $effect(() => {
    handleInputChange(value);
  });

  function handleInputChange(newValue: number | undefined): void {
    const { unit } = untrack(() => measurement);
    if (previousValue !== newValue) {
      const baseValue = round(unit.conversion.toBase(newValue));
      previousValue = baseValue;
      measurement = {
        unit,
        value: baseValue,
      };
    }
  }

  function handleMeasurementChange(newMeasurement: Measurement): void {
    const { value: newValue, unit: newUnit } = newMeasurement;

    if (previousValue !== newValue) {
      previousValue = newValue;
      value = round(newUnit.conversion.fromBase(newValue));
    }

    if (previousUnit !== newUnit) {
      previousUnit = newUnit;
      value = round(newUnit.conversion.fromBase(measurement.value));
    }
  }
</script>

<div class="input-group input-group-divider measurement-input grid-cols-[1fr_auto] {clazz ?? ''}">
  <input
    type="number"
    step="0.1"
    {placeholder}
    {disabled}
    {readonly}
    bind:value
    {onchange}
    {onfocus}
    {onblur}
    {onkeydown}
    {onkeyup}
  />
  <select class="focus:bg-surface-300 dark:focus:bg-surface-500" bind:value={measurement.unit}>
    {#each units as unit}
      <option value={unit}>{unit.label}</option>
    {/each}
  </select>
</div>
