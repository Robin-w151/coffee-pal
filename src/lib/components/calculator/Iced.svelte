<script lang="ts">
  import { sanitize } from '$lib/utils/math';
  import { RangeSlider, SlideToggle } from '@skeletonlabs/skeleton';
  import Label from '../ui/elements/Label.svelte';

  export let water: number;

  let iced: boolean;
  let iceRatio = 40;

  $: brewWater = sanitize((water * (100 - iceRatio)) / 100);
  $: ice = sanitize((water * iceRatio) / 100);
</script>

<div class="flex items-center gap-2">
  <SlideToggle name="Iced" size="sm" active="slide-toggle-active-token" bind:checked={iced} />
  <h3 class="h3">Iced Coffee</h3>
</div>
{#if iced}
  <form class="flex flex-col gap-4">
    <RangeSlider
      name="ice-ratio"
      min={30}
      max={70}
      accent="range-slider-accent-token"
      bind:value={iceRatio}
    >
      <div class="flex justify-between items-center">
        <span>Ice Ratio</span>
        <span>{iceRatio} %</span>
      </div>
    </RangeSlider>
    <Label text="Brew Water">
      <input class="input" readonly bind:value={brewWater} />
    </Label>
    <Label text="Ice">
      <input class="input" readonly bind:value={ice} />
    </Label>
  </form>
{/if}
