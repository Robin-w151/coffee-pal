<script lang="ts">
  import type { MeasurementSystem } from '$lib/models/measurement';
  import { settingsStore } from '$lib/stores/settings';
  import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
  import Label from '../../shared/elements/form/Label.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';

  let preferredUnits: MeasurementSystem = $state($settingsStore.preferredUnits);

  const measurementSystems: Array<{ value: MeasurementSystem; label: string }> = [
    { value: 'metric', label: 'Metric' },
    { value: 'imperial', label: 'Imperial' },
  ];

  function handlePreferredUnitsChange(details: { value: string | null }): void {
    preferredUnits = details.value as MeasurementSystem;
    settingsStore.setPreferredUnits(preferredUnits);
  }
</script>

<Card>
  <h3 class="h3">Units</h3>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
    <Label text="Preferred units">
      <SegmentedControl
        name="radio-preferred-units"
        value={preferredUnits}
        onValueChange={handlePreferredUnitsChange}
      >
        <SegmentedControl.Control class="radio-group-token">
          {#each measurementSystems as option (option.value)}
            <SegmentedControl.Item value={option.value} data-testid="radio-item">
              <SegmentedControl.ItemText>{option.label}</SegmentedControl.ItemText>
              <SegmentedControl.ItemHiddenInput />
            </SegmentedControl.Item>
          {/each}
          <SegmentedControl.Indicator />
        </SegmentedControl.Control>
      </SegmentedControl>
    </Label>
  </div>
</Card>
