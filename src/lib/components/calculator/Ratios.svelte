<script lang="ts">
  import type { Ratio } from '$lib/models/ratio';
  import type { Preset } from '$lib/models/preset';
  import { createEventDispatcher } from 'svelte';
  import presets from '$assets/presets.json';

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
    <button
      class="chip variant-soft hover:variant-filled"
      on:click={() => handlePresetClick(preset)}
    >
      <span>{preset.label}</span>
      <span class="font-bold">{preset.ratio.coffee}:{preset.ratio.water}</span>
    </button>
  {/each}
</div>
<div class="grid grid-cols-[auto_3rem_auto]">
  <label>
    <span>Coffee</span>
    <input
      class="input"
      type="number"
      bind:value={coffee}
      on:change={handleCoffeeChange}
      on:blur={handleCoffeeChange}
    />
  </label>
  <div class="flex flex-col">
    <div class="flex-1 max-h-[24px]" />
    <div class="flex-1 flex justify-center items-center">:</div>
  </div>
  <label>
    <span>Water</span>
    <input
      class="input"
      type="number"
      bind:value={water}
      on:change={handleWaterChange}
      on:blur={handleWaterChange}
    />
  </label>
</div>
