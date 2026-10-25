<script lang="ts">
  import type { MeasurementSystem } from '$lib/models/measurement';
  import { getSettingsStore } from '$lib/stores/settings.svelte';
  import Label from '../../shared/elements/form/Label.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';
  import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';

  const settingsStore = getSettingsStore();
  const unitOptions = [
    { value: 'metric', label: 'Metric' },
    { value: 'imperial', label: 'Imperial' },
  ] as const;

  let preferredUnits: MeasurementSystem = $state(settingsStore.preferredUnits);

  $effect(() => {
    settingsStore.setPreferredUnits(preferredUnits);
  });
</script>

<Card>
  <h3 class="h3">Units</h3>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
    <Label text="Preferred units">
      <SegmentedControl
        name="radio-preferred-units"
        options={unitOptions}
        bind:value={preferredUnits}
      />
    </Label>
  </div>
</Card>
