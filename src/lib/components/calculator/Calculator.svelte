<script lang="ts">
  import type { Preset } from '$lib/models/preset';
  import type { Ratio } from '$lib/models/ratio';
  import Ratios from './Ratios.svelte';
  import Recipe from './Recipe.svelte';

  let preset: Preset = {
    label: 'Default',
    ratio: {
      coffee: 3,
      water: 50,
    },
    factor: 4,
  };

  function handlePresetSelect({ detail: newPreset }: { detail: Preset }): void {
    preset = newPreset;
  }

  function handleRatioChange({ detail: ratio }: { detail: Ratio }): void {
    preset = {
      label: 'Custom',
      ratio,
      factor: 1,
    };
  }
</script>

<div class="flex flex-col gap-4">
  <Ratios ratio={preset.ratio} on:presetSelect={handlePresetSelect} on:ratioChange={handleRatioChange} />
  <hr />
  <Recipe {preset} />
</div>
