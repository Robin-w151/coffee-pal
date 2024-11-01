<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import ToggleableSection from '$lib/components/shared/elements/ToggleableSection.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { UNIT_FAHRENHEIT } from '$lib/config/units';
  import { round } from '$lib/shared/math';

  interface Props {
    temperatureConverter?: boolean;
    cardClass?: string | undefined;
  }

  let { temperatureConverter = $bindable(false), cardClass = undefined }: Props = $props();

  let celsius: number | undefined = $state(100);
  let fahrenheit: number | undefined = $state(212);

  function handleCelsiusChange(): void {
    fahrenheit = round(UNIT_FAHRENHEIT.conversion.fromBase(celsius));
  }

  function handleFahrenheitChange(): void {
    celsius = round(UNIT_FAHRENHEIT.conversion.toBase(fahrenheit));
  }
</script>

<Card class={cardClass}>
  <ToggleableSection
    name="temperature-converter"
    label="Toggle Temperature Converter"
    title="Temperature Converter"
    bind:active={temperatureConverter}
  >
    <div class="grid sm:grid-cols-[1fr_auto_1fr] gap-4">
      <Label text="Celsius">
        <input
          class="input"
          type="number"
          bind:value={celsius}
          onchange={handleCelsiusChange}
          onblur={handleCelsiusChange}
        />
      </Label>
      <div class="hidden sm:flex flex-col gap-1">
        <div class="h-[24px]"></div>
        <hr class="flex-1 divider-vertical" />
      </div>
      <Label text="Fahrenheit">
        <input
          class="input"
          type="number"
          bind:value={fahrenheit}
          onchange={handleFahrenheitChange}
          onblur={handleFahrenheitChange}
        />
      </Label>
    </div>
  </ToggleableSection>
</Card>
