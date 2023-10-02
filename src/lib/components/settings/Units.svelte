<script lang="ts">
  import type { MeasurementSystem } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

  let preferredUnits: MeasurementSystem = $settingsStore.preferredUnits;

  $: settingsStore.setPreferredUnits(preferredUnits);
</script>

<h3 class="h3">Units</h3>
<div class="flex justify-between items-center gap-4">
  <span>Preferred units</span>
  <RadioGroup>
    <RadioItem name="radio-preferred-units" value={'metric'} bind:group={preferredUnits}
      >Metric</RadioItem
    >
    <RadioItem name="radio-preferred-units" value={'imperial'} bind:group={preferredUnits}
      >Imperial</RadioItem
    >
  </RadioGroup>
</div>
