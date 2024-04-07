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

  let preset: Preset = presets.find((p) => p.label === 'Orea') ?? presets[0];
  let recipe: IRecipe = calculateRecipe(preset);
  let fixedRatio = true;
  let iceRatio: number | undefined = undefined;

  function handlePresetSelect({ detail: newPreset }: { detail: Preset }): void {
    preset = newPreset;
    recipe = calculateRecipe(newPreset);
    fixedRatio = true;
    iceRatio = newPreset.iceRatio;
  }

  function handleRatioChange({ detail: ratio }: { detail: Ratio }): void {
    const factor = calculateFactor(ratio);
    preset = {
      label: 'Custom',
      ratio,
      factor,
    };
    recipe = calculateRecipe(preset);
    fixedRatio = true;
  }

  function handleCoffeeChange({ detail: coffee }: { detail: number }): void {
    if (fixedRatio) {
      const water = calculateWater(coffee, preset.ratio);
      const output = calculateOutput(coffee, water);
      recipe = {
        coffee,
        water,
        output,
      };
    } else {
      preset = calculatePreset(coffee, recipe.water);
      recipe = {
        ...recipe,
        coffee,
        output: calculateOutput(coffee, recipe.water),
      };
    }
  }

  function handleWaterChange({ detail: water }: { detail: number }): void {
    if (fixedRatio) {
      const coffee = calculateCoffee(water, preset.ratio);
      const output = calculateOutput(coffee, water);
      recipe = {
        coffee,
        water,
        output,
      };
    } else {
      preset = calculatePreset(recipe.coffee, water);
      recipe = {
        ...recipe,
        water,
        output: calculateOutput(recipe.coffee, water),
      };
    }
  }

  function handleOutputChange({ detail: output }: { detail: number }): void {
    if (fixedRatio) {
      const water = calculateWaterFromOutput(output, preset.ratio);
      const coffee = calculateCoffeeFromOutput(output, preset.ratio);
      recipe = {
        coffee,
        water,
        output,
      };
    } else {
      const water = calculateWaterFromCoffeeAndOutput(recipe.coffee, output);
      preset = calculatePreset(recipe.coffee, water);
      recipe = {
        ...recipe,
        water,
        output,
      };
    }
  }

  function calculateWater(coffee: number, ratio: Ratio): number {
    return sanitize((coffee * ratio.water) / ratio.coffee);
  }

  function calculateWaterFromOutput(output: number, ratio: Ratio): number {
    const ratioFactor = ratio.water / ratio.coffee;
    return sanitize((output / (ratioFactor - 2)) * ratioFactor);
  }

  function calculateWaterFromCoffeeAndOutput(coffee: number, output: number): number {
    return sanitize(output + coffee * 2);
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

  function calculatePreset(coffee: number, water: number): Preset {
    const ratio = calculateRatio(coffee, water);

    return {
      label: 'Custom',
      ratio,
      factor: sanitize(water / ratio.water),
    };
  }

  function calculateRatio(coffee: number, water: number): Ratio {
    if (coffee === 0) {
      return {
        coffee: 0,
        water,
      };
    }

    return {
      coffee: 1,
      water: sanitize(water / coffee),
    };
  }

  function calculateFactor(ratio: Ratio): number {
    let factor = 1;
    for (; ratio.water * factor < 250; factor++);
    return factor;
  }
</script>

<PageHeader title="Brewing Calculator" />
<PageCard display="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
  <Ratios
    ratio={preset.ratio}
    on:presetSelect={handlePresetSelect}
    on:ratioChange={handleRatioChange}
  />
  <hr class="md:divider-vertical md:h-full" />
  <Recipe
    {recipe}
    bind:fixedRatio
    on:coffeeChange={handleCoffeeChange}
    on:waterChange={handleWaterChange}
    on:outputChange={handleOutputChange}
  />
  <hr class="md:col-span-3" />
  <Iced class="md:col-span-3" water={recipe.water} iced={!!iceRatio} {iceRatio} />
</PageCard>
