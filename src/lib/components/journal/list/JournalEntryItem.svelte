<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { settingsStore } from '$lib/stores/settings';
  import { calculateRatio } from '$lib/shared/math';
  import {
    getDisplayValue,
    getPreferredTemperatureUnit,
    getPreferredWeightUnit,
  } from '$lib/shared/units';
  import { faEye } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import { getCoffeeLabel } from '$lib/models/myCoffees';

  export let entry: ActiveJournalEntry;

  const preferredWeightUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const preferredTemperatureUnit = getPreferredTemperatureUnit($settingsStore.preferredUnits);

  $: ratio = calculateRatio(entry.coffee, entry.water);
  $: coffeeType = getCoffeeLabel(entry.coffeeType);

  function details(entry: ActiveJournalEntry): string {
    const { water, coffee, waterTemperature, grindSettings, description } = entry;
    const amountsStr = `${getDisplayValue(water, preferredWeightUnit)}/${getDisplayValue(coffee, preferredWeightUnit)}`;
    const waterTemperatureStr = waterTemperature
      ? getDisplayValue(waterTemperature, preferredTemperatureUnit, true)
      : undefined;

    return [amountsStr, waterTemperatureStr, grindSettings, description]
      .filter((s) => !!s)
      .join(' | ');
  }
</script>

<div class="justify-between">
  <span class="max-sm:hidden badge variant-soft-tertiary w-16">{ratio ?? 'unknown'}</span>
  <span class="block min-w-0 flex-1 max-sm:!ml-0">
    <dt class="overflow-hidden text-ellipsis whitespace-nowrap">
      <span class="font-bold">{entry.method} - {coffeeType ?? 'Unknown'}</span>
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
