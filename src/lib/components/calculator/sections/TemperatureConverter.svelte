<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { rollDown } from '$lib/components/shared/transitions/rollDown';
  import { UNIT_FAHRENHEIT } from '$lib/config/units';
  import { round } from '$lib/shared/math';
  import { faArrowsLeftRight } from '@fortawesome/free-solid-svg-icons';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  export let temperatureConverter = false;
  export let cardClass: string | undefined = undefined;

  let celsius: number | undefined = 100;
  let fahrenheit: number | undefined = 212;

  function handleCelsiusChange(): void {
    fahrenheit = round(UNIT_FAHRENHEIT.conversion.fromBase(celsius));
  }

  function handleFahrenheitChange(): void {
    celsius = round(UNIT_FAHRENHEIT.conversion.toBase(fahrenheit));
  }
</script>

<Card class={cardClass}>
  <div class="flex items-center gap-2">
    <SlideToggle
      name="temperature-converter"
      label="Temperature Converter"
      size="sm"
      active="slide-toggle-active-token"
      bind:checked={temperatureConverter}
    />
    <h3 class="h3">Temperature Converter</h3>
  </div>
  {#if temperatureConverter}
    <div class="grid sm:grid-cols-[auto_3rem_auto] max-sm:gap-4" transition:rollDown>
      <Label text="Celsius">
        <input
          class="input"
          type="number"
          bind:value={celsius}
          on:change={handleCelsiusChange}
          on:blur={handleCelsiusChange}
        />
      </Label>
      <div class="hidden sm:flex flex-col gap-1">
        <div class="flex-1 max-h-[24px]" />
        <div class="flex-1 flex justify-center items-center font-bold text-2xl">
          <Icon data={faArrowsLeftRight} />
        </div>
      </div>
      <Label text="Fahrenheit">
        <input
          class="input"
          type="number"
          bind:value={fahrenheit}
          on:change={handleFahrenheitChange}
          on:blur={handleFahrenheitChange}
        />
      </Label>
    </div>
  {/if}
</Card>
