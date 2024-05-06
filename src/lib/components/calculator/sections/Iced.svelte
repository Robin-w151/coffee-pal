<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import Form from '$lib/components/shared/elements/form/Form.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { rollDown } from '$lib/components/shared/transitions/rollDown';
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { sanitize } from '$lib/utils/math';
  import { getPreferredWeightUnit } from '$lib/utils/units';
  import { RangeSlider, SlideToggle } from '@skeletonlabs/skeleton';

  export let water: number;
  export let iced = false;
  export let iceRatio = 30;
  export let cardClass: string | undefined = undefined;

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

  let brewWaterMeasurement: Measurement = {
    value: getBrewWater(water, iceRatio),
    unit: preferredUnit,
  };
  let iceMeasurement: Measurement = {
    value: getIce(water, iceRatio),
    unit: preferredUnit,
  };

  $: brewWaterMeasurement.value = getBrewWater(water, iceRatio);
  $: iceMeasurement.value = getIce(water, iceRatio);

  function getBrewWater(water: number, iceRatio: number): number {
    return sanitize((water * (100 - iceRatio)) / 100);
  }

  function getIce(water: number, iceRatio: number): number {
    return sanitize((water * iceRatio) / 100);
  }
</script>

<Card class={cardClass}>
  <div class="flex items-center gap-2">
    <SlideToggle
      name="iced-coffee"
      label="Iced Coffee"
      size="sm"
      active="slide-toggle-active-token"
      bind:checked={iced}
    />
    <h3 class="h3">Iced Coffee</h3>
  </div>
  {#if iced}
    <div transition:rollDown>
      <Form>
        <RangeSlider
          name="ice-ratio"
          min={0}
          max={100}
          accent="range-slider-accent-token"
          bind:value={iceRatio}
        >
          <div class="flex justify-between items-center">
            <span>Ice Ratio</span>
            <span>{iceRatio} %</span>
          </div>
        </RangeSlider>
        <div class="grid sm:grid-cols-2 gap-4 w-full">
          <Label text="Amount of brewing water">
            <MeasurementInput readonly {units} bind:measurement={brewWaterMeasurement} />
          </Label>
          <Label text="Amount of ice">
            <MeasurementInput readonly {units} bind:measurement={iceMeasurement} />
          </Label>
        </div>
      </Form>
    </div>
  {/if}
</Card>
