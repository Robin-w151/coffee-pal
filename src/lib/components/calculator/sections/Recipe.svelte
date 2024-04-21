<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import Form from '$lib/components/shared/elements/form/Form.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import type { Recipe } from '$lib/models/recipe';
  import { settingsStore } from '$lib/stores/settings';
  import { getPreferredWeightUnit } from '$lib/utils/units';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { createEventDispatcher } from 'svelte';

  export let fixedRatio = true;
  export let recipe: Recipe;

  const dispatch = createEventDispatcher();
  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

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

<Card>
  <h3 class="h3">Recipe</h3>
  <Form>
    <div class="flex items-center gap-2">
      <SlideToggle
        name="fixed-ratio"
        label="Fixed Ratio"
        size="sm"
        active="slide-toggle-active-token"
        bind:checked={fixedRatio}
      />
      <span>Fixed Ratio</span>
    </div>
    <Label text="Amount of water">
      <MeasurementInput
        {units}
        bind:measurement={waterMeasurement}
        on:change={handleWaterChange}
        on:blur={handleWaterChange}
      />
    </Label>
    <Label text="Amount of coffee">
      <MeasurementInput
        {units}
        bind:measurement={coffeeMeasurement}
        on:change={handleCoffeeChange}
        on:blur={handleCoffeeChange}
      />
    </Label>
    <Label text="Amount of brewed coffee">
      <MeasurementInput
        {units}
        bind:measurement={outputMeasurement}
        on:change={handleOutputChange}
        on:blur={handleOutputChange}
      />
    </Label>
  </Form>
</Card>
