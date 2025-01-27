<script lang="ts">
  import type { MeasurementSystem } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
  import Label from '../../shared/elements/form/Label.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';

  let preferredUnits: MeasurementSystem = $state($settingsStore.preferredUnits);

  $effect(() => {
    settingsStore.setPreferredUnits(preferredUnits);
  });
</script>

<Card>
  <h3 class="h3">Units</h3>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
    <Label text="Preferred units">
      <RadioGroup class="radio-group-token">
        <RadioItem name="radio-preferred-units" value="metric" bind:group={preferredUnits}
          >Metric</RadioItem
        >
        <RadioItem name="radio-preferred-units" value="imperial" bind:group={preferredUnits}
          >Imperial</RadioItem
        >
      </RadioGroup>
    </Label>
  </div>
</Card>
