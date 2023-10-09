<script lang="ts">
  import type { ColorScheme } from '$lib/models/settings';
  import { settingsStore } from '$lib/stores/settings';
  import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';

  let colorScheme: ColorScheme = $settingsStore.colorScheme;

  $: handleAppThemeChange(colorScheme);

  function handleAppThemeChange(colorScheme: ColorScheme): void {
    settingsStore.setColorScheme(colorScheme);
  }
</script>

<h3 class="h3">Appearance</h3>
<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
  <span>Color Scheme</span>
  <RadioGroup>
    <RadioItem name="radio-app-theme" value="system" bind:group={colorScheme}>System</RadioItem>
    <RadioItem name="radio-app-theme" value="light" bind:group={colorScheme}>Light</RadioItem>
    <RadioItem name="radio-app-theme" value="dark" bind:group={colorScheme}>Dark</RadioItem>
  </RadioGroup>
</div>
