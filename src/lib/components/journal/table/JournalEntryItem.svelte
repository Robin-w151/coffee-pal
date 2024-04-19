<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { settingsStore } from '$lib/stores/settings';
  import {
    getDisplayValue,
    getPreferredTemperatureUnit,
    getPreferredWeightUnit,
  } from '$lib/utils/units';

  export let entry: ActiveJournalEntry;

  const preferredWeightUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const preferredTemperatureUnit = getPreferredTemperatureUnit($settingsStore.preferredUnits);

  function handleEntryClick(): void {
    gotoDetail();
  }

  function handleEntryKeyDown(event: KeyboardEvent): void {
    const { code } = event;
    if (code === 'Enter' || code === 'Space') {
      event.preventDefault();
      gotoDetail();
    }
  }

  function gotoDetail(): void {
    goto(`/journal/${entry.id}`);
  }

  function waterDisplayValue(water: number): string {
    return getDisplayValue(water, preferredWeightUnit);
  }

  function coffeeDisplayValue(coffee: number): string {
    return getDisplayValue(coffee, preferredWeightUnit);
  }

  function waterTemperatureDisplayValue(waterTemperature: number): string {
    return getDisplayValue(waterTemperature, preferredTemperatureUnit, true);
  }
</script>

<tr tabindex="0" role="button" on:click={handleEntryClick} on:keydown={handleEntryKeyDown}>
  <td>{entry.method}</td>
  <td>{entry.coffeeType ?? 'Unknown'}</td>
  <td>{waterDisplayValue(entry.water)}/{coffeeDisplayValue(entry.coffee)}</td>
  <td>{entry.waterTemperature ? waterTemperatureDisplayValue(entry.waterTemperature) : 'N/A'}</td>
  <td>{entry.grindSettings || 'N/A'}</td>
</tr>
