<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { settingsStore } from '$lib/stores/settings';
  import { calculateRatio } from '$lib/shared/math';
  import {
    getDisplayValue,
    getPreferredTemperatureUnit,
    getPreferredWeightUnit,
  } from '$lib/shared/units';
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

<a
  class="flex items-center gap-4 px-3 sm:px-2 py-2 hover:bg-primary-500/10 rounded-md transition ease-out"
  href="/journal/{entry.id}"
>
  <span class="max-sm:hidden badge variant-soft-tertiary w-16">{ratio}</span>
  <span class="block min-w-0 flex-1 max-sm:!ml-0">
    <dt class="overflow-hidden text-ellipsis whitespace-nowrap">
      <span>{entry.method} - {coffeeType ?? 'Unknown'}</span>
    </dt>
    <dd class="font-normal overflow-hidden text-ellipsis whitespace-nowrap">
      <span class="sm:hidden">{ratio} - </span>
      <span>{details(entry)}</span>
    </dd>
  </span>
</a>
<hr />
