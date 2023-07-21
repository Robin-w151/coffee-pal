<script lang="ts">
  import { sanitize } from '$lib/utils/math';
  import { RangeSlider } from '@skeletonlabs/skeleton';

  export let water: number;

  let iced: boolean;
  let iceRatio = 40;

  $: brewWater = sanitize((water * (100 - iceRatio)) / 100);
  $: ice = sanitize((water * iceRatio) / 100);
</script>

<h3 class="h3">Iced Coffee</h3>
<form class="flex flex-col gap-4">
  <label class="flex items-center space-x-2">
    <input class="checkbox" type="checkbox" bind:checked={iced} />
    <span>Iced</span>
  </label>
  {#if iced}
    <RangeSlider name="ice-ratio" min={30} max={70} bind:value={iceRatio} ticked>
      <div class="flex justify-between items-center">
        <span>Ice Ratio</span>
        <span>{iceRatio} %</span>
      </div>
    </RangeSlider>
    <label>
      <span>Brew Water</span>
      <input class="input" readonly bind:value={brewWater} />
    </label>
    <label>
      <span>Ice</span>
      <input class="input" readonly bind:value={ice} />
    </label>
  {/if}
</form>