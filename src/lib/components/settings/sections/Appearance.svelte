<script lang="ts">
  import type { ColorScheme } from '$lib/models/settings';
  import { settingsStore } from '$lib/stores/settings';
  import { SegmentedControl } from '@skeletonlabs/skeleton-svelte';
  import Label from '../../shared/elements/form/Label.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';

  let colorScheme: ColorScheme = $state($settingsStore.colorScheme);

  const colorSchemes: Array<{ value: ColorScheme; label: string }> = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];

  function handleColorSchemeChange(details: { value: string | null }): void {
    colorScheme = details.value as ColorScheme;
    settingsStore.setColorScheme(colorScheme);
  }
</script>

<Card>
  <h3 class="h3">Appearance</h3>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
    <Label text="Color Scheme">
      <SegmentedControl
        name="radio-app-theme"
        value={colorScheme}
        onValueChange={handleColorSchemeChange}
      >
        <SegmentedControl.Control class="radio-group-token">
          {#each colorSchemes as option (option.value)}
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
