<script lang="ts">
  import type { AppTheme } from '$lib/models/appTheme';
  import { RadioGroup, RadioItem, modeOsPrefers, modeUserPrefers } from '@skeletonlabs/skeleton';

  let appTheme: AppTheme = getCurrentAppTheme();

  $: handleAppThemeChange(appTheme);

  function handleAppThemeChange(appTheme: AppTheme): void {
    switch (appTheme) {
      case 'system':
        return;
      case 'light':
        return;
      case 'dark':
        return;
    }
  }

  function getCurrentAppTheme(): AppTheme {
    return $modeOsPrefers ? 'system' : $modeUserPrefers ? 'light' : 'dark';
  }
</script>

<h3 class="h3">Appearance</h3>
<div class="flex justify-between items-center gap-4">
  <span>App Theme</span>
  <RadioGroup>
    <RadioItem name="radio-app-theme" value="system" bind:group={appTheme}>System</RadioItem>
    <RadioItem name="radio-app-theme" value="light" bind:group={appTheme}>Light</RadioItem>
    <RadioItem name="radio-app-theme" value="dark" bind:group={appTheme}>Dark</RadioItem>
  </RadioGroup>
</div>
