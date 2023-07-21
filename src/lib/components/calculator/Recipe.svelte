<script lang="ts">
  import type { Preset } from '$lib/models/preset';
  import type { Ratio } from '$lib/models/ratio';

  export let preset: Preset;

  let water: number = preset.ratio.water * preset.factor;
  let coffee: number = preset.ratio.coffee * preset.factor;
  let output = calculateOutput(coffee, water);

  $: handlePresetChange(preset);

  function handlePresetChange(preset: Preset): void {
    water = preset.ratio.water * preset.factor;
    coffee = preset.ratio.coffee * preset.factor;
    output = calculateOutput(coffee, water);
  }

  function handleCoffeeChange(): void {
    water = calculateWater(coffee, preset.ratio);
    output = calculateOutput(coffee, water);
  }

  function handleWaterChange(): void {
    coffee = calculateCoffee(water, preset.ratio);
    output = calculateOutput(coffee, water);
  }

  function handleOutputChange(): void {
    water = calculateWaterFromOutput(output, preset.ratio);
    coffee = calculateCoffeeFromOutput(output, preset.ratio);
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

  function sanitize(value?: number | null): number {
    if (!value || value < 0) {
      return 0;
    }

    return parseFloat(value.toFixed(2));
  }
</script>

<h3 class="h3">Recipe</h3>
<form class="flex flex-col gap-4">
  <label>
    <span>Water</span>
    <input class="input" type="number" on:change={handleWaterChange} bind:value={water} />
  </label>
  <label>
    <span>Coffee</span>
    <input class="input" type="number" on:change={handleCoffeeChange} bind:value={coffee} />
  </label>
  <label>
    <span>Output</span>
    <input class="input" type="number" on:change={handleOutputChange} bind:value={output} />
  </label>
</form>
