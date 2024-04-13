<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { settingsStore } from '$lib/stores/settings';
  import { calculateRatio, round } from '$lib/utils/math';
  import { getPreferredTemperatureUnit, getPreferredWeightUnit } from '$lib/utils/units';
  import { faEye } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  export let entry: ActiveJournalEntry;

  const preferredWeightUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const preferredTemperatureUnit = getPreferredTemperatureUnit($settingsStore.preferredUnits);

  $: ratio = calculateRatio(entry.coffee, entry.water) ?? 'unknown';

  function details(entry: ActiveJournalEntry): string {
    const { water, coffee, waterTemperature, grindSettings, description } = entry;
    const amountsStr = `${round(preferredWeightUnit.conversion.fromBase(water))}${
      preferredWeightUnit.label
    }/${round(preferredWeightUnit.conversion.fromBase(coffee))}${preferredWeightUnit.label}`;
    const waterTemperatureStr = waterTemperature
      ? `${round(preferredTemperatureUnit.conversion.fromBase(waterTemperature))} ${
          preferredTemperatureUnit.label
        }`
      : undefined;

    return [amountsStr, waterTemperatureStr, grindSettings, description]
      .filter((s) => !!s)
      .join(' | ');
  }
</script>

<div class="justify-between">
  <span class="max-sm:hidden badge variant-soft-tertiary w-16">{ratio}</span>
  <span class="block min-w-0 flex-1 max-sm:!ml-0">
    <dt class="overflow-hidden text-ellipsis whitespace-nowrap">
      <span class="font-bold">{entry.method} - {entry.coffeeType || 'Unknown'}</span>
    </dt>
    <dd class="overflow-hidden text-ellipsis whitespace-nowrap">
      <span class="sm:hidden">{ratio} - </span>
      <span>{details(entry)}</span>
    </dd>
  </span>
  <span class="flex gap-2">
    <a class="btn btn-icon hover:variant-soft-secondary" title="Show" href="/journal/{entry.id}">
      <Icon data={faEye} />
      <span class="sr-only">Show</span>
    </a>
  </span>
</div>
