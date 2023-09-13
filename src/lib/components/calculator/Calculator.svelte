<script lang="ts">
  import type { Preset } from '$lib/models/preset';
  import type { Ratio } from '$lib/models/ratio';
  import Ratios from './Ratios.svelte';
  import Recipe from './Recipe.svelte';
  import type { Recipe as IRecipe } from '$lib/models/recipe';
  import presets from '$assets/presets.json';
  import Iced from './Iced.svelte';
  import { sanitize } from '$lib/utils/math';
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageHeader from '../ui/elements/page/PageHeader.svelte';

  let preset: Preset = presets[4];
  let recipe: IRecipe = calculateRecipe(preset);

  function handlePresetSelect({ detail: newPreset }: { detail: Preset }): void {
    preset = newPreset;
    recipe = calculateRecipe(newPreset);
  }

  function handleRatioChange({ detail: ratio }: { detail: Ratio }): void {
    preset = {
      label: 'Custom',
      ratio,
      factor: 1,
    };
    recipe = calculateRecipe(preset);
  }

  function handleCoffeeChange({ detail: coffee }: { detail: number }): void {
    const water = calculateWater(coffee, preset.ratio);
    const output = calculateOutput(coffee, water);
    recipe = {
      coffee,
      water,
      output,
    };
  }

  function handleWaterChange({ detail: water }: { detail: number }): void {
    const coffee = calculateCoffee(water, preset.ratio);
    const output = calculateOutput(coffee, water);
    recipe = {
      coffee,
      water,
      output,
    };
  }

  function handleOutputChange({ detail: output }: { detail: number }): void {
    const water = calculateWaterFromOutput(output, preset.ratio);
    const coffee = calculateCoffeeFromOutput(output, preset.ratio);
    recipe = {
      coffee,
      water,
      output,
    };
  }

  function calculateWater(coffee: number, ratio: Ratio): number {
    return sanitize((coffee * ratio.water) / ratio.coffee);
  }

  function calculateWaterFromOutput(output: number, ratio: Ratio): number {
    const ratioFactor = ratio.water / ratio.coffee;
    return sanitize((output / (ratioFactor - 2)) * ratioFactor);
  }

  function calculateCoffee(water: number, ratio: Ratio): number {
    return sanitize((water * ratio.coffee) / ratio.water);
  }

  function calculateCoffeeFromOutput(output: number, ratio: Ratio): number {
    const ratioFactor = ratio.water / ratio.coffee;
    return sanitize(output / (ratioFactor - 2));
  }

  function calculateOutput(coffee: number, water: number): number {
    return sanitize(water - 2 * coffee);
  }

  function calculateRecipe(preset: Preset): IRecipe {
    const coffee = preset.ratio.coffee * preset.factor;
    const water = preset.ratio.water * preset.factor;
    const output = calculateOutput(coffee, water);
    return { coffee, water, output };
  }
</script>

<PageHeader title="Brewing Calculator" />
<PageCard>
  <Ratios
    ratio={preset.ratio}
    on:presetSelect={handlePresetSelect}
    on:ratioChange={handleRatioChange}
  />
  <hr />
  <Recipe
    {recipe}
    on:coffeeChange={handleCoffeeChange}
    on:waterChange={handleWaterChange}
    on:outputChange={handleOutputChange}
  />
  <hr />
  <Iced water={recipe.water} />
</PageCard>
