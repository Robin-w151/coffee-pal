<script lang="ts">
  import presets from '$assets/presets.json';
  import Card from '$lib/components/shared/elements/Card.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import type { Preset } from '$lib/models/preset';
  import type { Ratio } from '$lib/models/ratio';

  interface Props {
    ratio: Ratio | undefined;
    onPresetSelect: (preset: Preset) => void;
    onRatioChange: (ratio: Ratio) => void;
  }

  let { ratio, onPresetSelect, onRatioChange }: Props = $props();

  let coffee: number = $state(0);
  let water: number = $state(0);

  $effect(() => {
    handleRatioChange(ratio);
  });

  function handlePresetClick(preset: Preset): void {
    onPresetSelect(preset);
  }

  function handleRatioChange(ratio?: Ratio): void {
    coffee = ratio?.coffee ?? 0;
    water = ratio?.water ?? 0;
  }

  function handleCoffeeChange(): void {
    onRatioChange({ water: 0, ...ratio, coffee });
  }

  function handleWaterChange(): void {
    onRatioChange({ coffee: 0, ...ratio, water });
  }
</script>

<Card>
  <h3 class="h3">Ratio</h3>
  <div class="flex flex-col items-start gap-1 flex-1">
    <span>Suggestions</span>
    <div class="flex flex-wrap gap-2">
      {#each presets as preset (preset.label)}
        <button class="chip-interactive-token" onclick={() => handlePresetClick(preset)}>
          <span class="font-normal">{preset.label}</span>
          <span>{preset.ratio.coffee}:{preset.ratio.water}</span>
        </button>
      {/each}
    </div>
  </div>
  <div class="grid grid-cols-[auto_3rem_auto]">
    <Label text="Coffee">
      <input
        class="input"
        type="number"
        bind:value={coffee}
        onchange={handleCoffeeChange}
        onblur={handleCoffeeChange}
      />
    </Label>
    <div class="flex flex-col">
      <div class="flex-1 max-h-[24px]"></div>
      <div class="flex-1 flex justify-center items-center font-bold text-2xl">:</div>
    </div>
    <Label text="Water">
      <input
        class="input"
        type="number"
        bind:value={water}
        onchange={handleWaterChange}
        onblur={handleWaterChange}
      />
    </Label>
  </div>
</Card>
