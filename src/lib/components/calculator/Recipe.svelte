<script lang="ts">
  import { UNIT_GRAM, WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import type { Recipe } from '$lib/models/recipe';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredUnit } from '$lib/utils/units';
  import { createEventDispatcher } from 'svelte';
  import Label from '../ui/elements/form/Label.svelte';
  import MeasurementInput from '../ui/elements/form/MeasurementInput.svelte';

  export let recipe: Recipe;

  const dispatch = createEventDispatcher();
  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredUnit(units, $settingsStore.preferredUnits) ?? UNIT_GRAM;

  let coffeeMeasurement: Measurement = {
    value: recipe.coffee,
    unit: preferredUnit,
  };
  let waterMeasurement: Measurement = {
    value: recipe.water,
    unit: preferredUnit,
  };
  let outputMeasurement: Measurement = {
    value: recipe.output,
    unit: preferredUnit,
  };

  $: handleRecipeChange(recipe);

  function handleRecipeChange(recipe: Recipe): void {
    coffeeMeasurement.value = recipe.coffee;
    waterMeasurement.value = recipe.water;
    outputMeasurement.value = recipe.output;
  }

  function handleCoffeeChange(): void {
    dispatch('coffeeChange', coffeeMeasurement.value);
  }

  function handleWaterChange(): void {
    dispatch('waterChange', waterMeasurement.value);
  }

  function handleOutputChange(): void {
    dispatch('outputChange', outputMeasurement.value);
  }
</script>

<h3 class="h3">Recipe</h3>
<form class="flex flex-col gap-4">
  <Label text="Water">
    <MeasurementInput
      {units}
      bind:measurement={waterMeasurement}
      on:change={handleWaterChange}
      on:blur={handleWaterChange}
    />
  </Label>
  <Label text="Coffee">
    <MeasurementInput
      {units}
      bind:measurement={coffeeMeasurement}
      on:change={handleCoffeeChange}
      on:blur={handleCoffeeChange}
    />
  </Label>
  <Label text="Output">
    <MeasurementInput
      {units}
      bind:measurement={outputMeasurement}
      on:change={handleOutputChange}
      on:blur={handleOutputChange}
    />
  </Label>
</form>
