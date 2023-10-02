<script lang="ts">
  import type { Measurement, Unit } from '$lib/models/measurement';
  import { round } from '$lib/utils/math';
  import { beforeUpdate } from 'svelte';

  export let measurement: Measurement;
  export let units: Array<Unit>;
  export let placeholder: string | undefined = undefined;
  export let disabled = false;
  export let readonly = false;

  let value = measurement.unit.conversion.fromBase(measurement.value);
  let previousValue: number | undefined;
  let previousUnit: Unit;

  $: measurementValue = measurement.value;
  $: measurementUnit = measurement.unit;

  $: handleValueChange(value);
  $: handleMeasurementValueChange(measurementValue);
  $: handleMeasurementUnitChange(measurementUnit);

  beforeUpdate(() => {
    previousValue = measurement.value;
    previousUnit = measurement.unit;
  });

  function handleValueChange(value?: number): void {
    console.log('value change');
    measurement.value = round(measurement.unit.conversion.toBase(value));
  }

  function handleMeasurementValueChange(newValue?: number): void {
    if (previousValue === newValue) {
      return;
    }
    console.log('measurement value change');
    value = round(measurement.unit.conversion.fromBase(newValue));
  }

  function handleMeasurementUnitChange(newUnit: Unit): void {
    if (previousUnit === newUnit) {
      return;
    }
    console.log('measurement unit change');
    value = round(newUnit.conversion.fromBase(measurement.value));
  }
</script>

<div class="input-group input-group-divider grid-cols-[1fr_auto] {$$props.class ?? ''}">
  <input
    type="number"
    {placeholder}
    {disabled}
    {readonly}
    bind:value
    on:change
    on:input
    on:focus
    on:blur
    on:keydown
    on:keyup
    on:paste
  />
  <select bind:value={measurement.unit}>
    {#each units as unit}
      <option value={unit}>{unit.label}</option>
    {/each}
  </select>
</div>
