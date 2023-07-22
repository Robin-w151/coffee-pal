<script lang="ts">
  import type { Ratio } from '$lib/models/ratio';
  import type { Preset } from '$lib/models/preset';
  import { createEventDispatcher } from 'svelte';
  import presets from '$assets/presets.json';
  import Label from '../ui/elements/Label.svelte';

  export let ratio: Ratio | undefined;

  const dispatch = createEventDispatcher();

  let coffee: number;
  let water: number;

  $: handleRatioChange(ratio);

  function handlePresetClick(preset: Preset): void {
    dispatch('presetSelect', preset);
  }

  function handleRatioChange(ratio?: Ratio): void {
    coffee = ratio?.coffee ?? 0;
    water = ratio?.water ?? 0;
  }

  function handleCoffeeChange(): void {
    dispatch('ratioChange', { ...ratio, coffee });
  }

  function handleWaterChange(): void {
    dispatch('ratioChange', { ...ratio, water });
  }
</script>

<h3 class="h3">Ratio</h3>
<div class="flex flex-wrap gap-2">
  {#each presets as preset}
    <button class="chip-interactive-token" on:click={() => handlePresetClick(preset)}>
      <span class="font-normal">{preset.label}</span>
      <span>{preset.ratio.coffee}:{preset.ratio.water}</span>
    </button>
  {/each}
</div>
<div class="grid grid-cols-[auto_3rem_auto]">
  <Label text="Coffee">
    <input
      class="input"
      type="number"
      bind:value={coffee}
      on:change={handleCoffeeChange}
      on:blur={handleCoffeeChange}
    />
  </Label>
  <div class="flex flex-col">
    <div class="flex-1 max-h-[24px]" />
    <div class="flex-1 flex justify-center items-center">:</div>
  </div>
  <Label text="Water">
    <input
      class="input"
      type="number"
      bind:value={water}
      on:change={handleWaterChange}
      on:blur={handleWaterChange}
    />
  </Label>
</div>
