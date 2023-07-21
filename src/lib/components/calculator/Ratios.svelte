<script lang="ts">
  import type { Ratio } from '$lib/models/ratio';
  import type { Preset } from '$lib/models/preset';
  import { createEventDispatcher } from 'svelte';

  export let ratio: Ratio | undefined;

  const dispatch = createEventDispatcher();
  const presets: Array<Preset> = [
    {
      label: 'Aeropress',
      ratio: {
        coffee: 1,
        water: 6,
      },
      factor: 30,
    },
    {
      label: 'Moka Pot',
      ratio: {
        coffee: 1,
        water: 10,
      },
      factor: 9,
    },
    {
      label: 'French Press',
      ratio: {
        coffee: 1,
        water: 12,
      },
      factor: 30,
    },
    {
      label: 'V60',
      ratio: {
        coffee: 3,
        water: 50,
      },
      factor: 4,
    },
    {
      label: 'Chemex',
      ratio: {
        coffee: 1,
        water: 17,
      },
      factor: 30,
    },
    {
      label: 'Cold Brew',
      ratio: {
        coffee: 3,
        water: 40,
      },
      factor: 30,
    },
  ];

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
    <button class="chip variant-soft hover:variant-filled" on:click={() => handlePresetClick(preset)}>
      <span>{preset.label}</span>
      <span class="font-bold">{preset.ratio.coffee}:{preset.ratio.water}</span>
    </button>
  {/each}
</div>
<div class="grid grid-cols-[auto_3rem_auto]">
  <label>
    <span>Coffee</span>
    <input class="input" type="number" on:change={handleCoffeeChange} bind:value={coffee} />
  </label>
  <div class="flex flex-col">
    <div class="flex-1 max-h-[24px]" />
    <div class="flex-1 flex justify-center items-center">:</div>
  </div>
  <label>
    <span>Water</span>
    <input class="input" type="number" on:change={handleWaterChange} bind:value={water} />
  </label>
</div>
