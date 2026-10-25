<script lang="ts">
  import type { ColorScheme } from '$lib/models/settings';
  import { getSettingsStore } from '$lib/stores/settings.svelte';
  import Label from '../../shared/elements/form/Label.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';
  import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';

  const settingsStore = getSettingsStore();
  const colorSchemeOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ] as const;

  let colorScheme: ColorScheme = $state(settingsStore.colorScheme);

  $effect(() => {
    handleAppThemeChange(colorScheme);
  });

  function handleAppThemeChange(colorScheme: ColorScheme): void {
    settingsStore.setColorScheme(colorScheme);
  }
</script>

<Card>
  <h3 class="h3">Appearance</h3>
  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
    <Label text="Color Scheme">
      <SegmentedControl
        name="radio-app-theme"
        options={colorSchemeOptions}
        bind:value={colorScheme}
      />
    </Label>
  </div>
</Card>
