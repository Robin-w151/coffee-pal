<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import Form from '$lib/components/shared/elements/form/Form.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { WEIGHT_UNITS, WEIGHT_UNITS_COFFEE } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import type { Recipe } from '$lib/models/recipe';
  import { getPreferredWeightUnit } from '$lib/shared/units';
  import { settingsStore } from '$lib/stores/settings';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { untrack } from 'svelte';

  interface Props {
    fixedRatio?: boolean;
    recipe: Recipe;
    onCoffeeChange: (coffee: number) => void;
    onWaterChange: (water: number) => void;
    onOutputChange: (output: number) => void;
  }

  let {
    fixedRatio = $bindable(true),
    recipe,
    onCoffeeChange,
    onWaterChange,
    onOutputChange,
  }: Props = $props();

  const units = WEIGHT_UNITS;
  const units_coffee = WEIGHT_UNITS_COFFEE;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

  let coffeeMeasurement: Measurement = $state({
    value: recipe.coffee,
    unit: preferredUnit,
  });
  let waterMeasurement: Measurement = $state({
    value: recipe.water,
    unit: preferredUnit,
  });
  let outputMeasurement: Measurement = $state({
    value: recipe.output,
    unit: preferredUnit,
  });

  $effect(() => {
    handleRecipeChange(recipe);
  });

  function handleRecipeChange(newRecipe: Recipe): void {
    untrack(() => {
      coffeeMeasurement.value = newRecipe.coffee;
      waterMeasurement.value = newRecipe.water;
      outputMeasurement.value = newRecipe.output;
    });
  }

  function handleCoffeeChange(): void {
    if (coffeeMeasurement.value !== undefined) {
      onCoffeeChange(coffeeMeasurement.value);
    }
  }

  function handleWaterChange(): void {
    if (waterMeasurement.value !== undefined) {
      onWaterChange(waterMeasurement.value);
    }
  }

  function handleOutputChange(): void {
    if (outputMeasurement.value !== undefined) {
      onOutputChange(outputMeasurement.value);
    }
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
        onchange={handleWaterChange}
        onblur={handleWaterChange}
      />
    </Label>
    <Label text="Amount of coffee">
      <MeasurementInput
        units={units_coffee}
        bind:measurement={coffeeMeasurement}
        onchange={handleCoffeeChange}
        onblur={handleCoffeeChange}
      />
    </Label>
    <Label text="Amount of brewed coffee">
      <MeasurementInput
        {units}
        bind:measurement={outputMeasurement}
        onchange={handleOutputChange}
        onblur={handleOutputChange}
      />
    </Label>
  </Form>
</Card>
