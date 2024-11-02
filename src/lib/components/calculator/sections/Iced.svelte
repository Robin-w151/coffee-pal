<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import ToggleableSection from '$lib/components/shared/elements/ToggleableSection.svelte';
  import Form from '$lib/components/shared/elements/form/Form.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import MeasurementInput from '$lib/components/shared/elements/form/MeasurementInput.svelte';
  import { WEIGHT_UNITS } from '$lib/config/units';
  import type { Measurement } from '$lib/models/measurement';
  import { sanitize } from '$lib/shared/math';
  import { getPreferredWeightUnit } from '$lib/shared/units';
  import { settingsStore } from '$lib/stores/settings';
  import { RangeSlider } from '@skeletonlabs/skeleton';

  interface Props {
    water: number;
    iced?: boolean;
    iceRatio?: number;
    cardClass?: string | undefined;
  }

  let {
    water,
    iced = $bindable(false),
    iceRatio = $bindable(30),
    cardClass = undefined,
  }: Props = $props();

  const units = WEIGHT_UNITS;
  const preferredUnit = getPreferredWeightUnit($settingsStore.preferredUnits);

  let brewWaterMeasurement: Measurement = $state({
    value: getBrewWater(water, iceRatio),
    unit: preferredUnit,
  });
  let iceMeasurement: Measurement = $state({
    value: getIce(water, iceRatio),
    unit: preferredUnit,
  });

  $effect(() => {
    brewWaterMeasurement.value = getBrewWater(water, iceRatio);
    iceMeasurement.value = getIce(water, iceRatio);
  });

  function getBrewWater(water: number, iceRatio: number): number {
    return sanitize((water * (100 - iceRatio)) / 100);
  }

  function getIce(water: number, iceRatio: number): number {
    return sanitize((water * iceRatio) / 100);
  }
</script>

<Card class={cardClass}>
  <ToggleableSection
    name="iced-coffee"
    label="Toggle Iced Coffee"
    title="Iced Coffee"
    bind:active={iced}
  >
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
      <div class="grid sm:grid-cols-[1fr_auto_1fr] gap-4 w-full">
        <Label text="Amount of brewing water">
          <MeasurementInput readonly {units} bind:measurement={brewWaterMeasurement} />
        </Label>
        <div class="hidden sm:flex flex-col gap-1">
          <div class="h-[24px]"></div>
          <hr class="flex-1 divider-vertical" />
        </div>
        <Label text="Amount of ice">
          <MeasurementInput readonly {units} bind:measurement={iceMeasurement} />
        </Label>
      </div>
    </Form>
  </ToggleableSection>
</Card>
