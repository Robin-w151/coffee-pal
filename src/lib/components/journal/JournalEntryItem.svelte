<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { settingsStore } from '$lib/stores/settings';
  import { calculateRatio, round } from '$lib/utils/math';
  import { getPreferredTemperatureUnit, getPreferredWeightUnit } from '$lib/utils/units';
  import { faPencil, faRotateRight } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';

  export let entry: ActiveJournalEntry;

  const dispatch = createEventDispatcher();
  const preferredWeightUnit = getPreferredWeightUnit($settingsStore.preferredUnits);
  const preferredTemperatureUnit = getPreferredTemperatureUnit($settingsStore.preferredUnits);

  $: ratio = calculateRatio(entry.coffee, entry.water) ?? 'unknown';

  function handleCopyClick(): void {
    const copy = { ...entry, id: uuid() };
    dispatch('copy', copy);
  }

  function handleUpdateClick(): void {
    const copy = { ...entry };
    dispatch('update', copy);
  }

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
  <span class="block min-w-0 flex-1">
    <dt class="overflow-hidden text-ellipsis">
      <span class="font-bold">{entry.method} - {entry.coffeeType || 'Unknown'}</span>
    </dt>
    <dd class="overflow-hidden text-ellipsis">
      <span class="sm:hidden">{ratio} - </span>
      <span>{details(entry)}</span>
    </dd>
  </span>
  <span class="flex gap-2">
    <button
      class="btn btn-icon hover:variant-soft-secondary"
      title="Repeat"
      on:click={handleCopyClick}
    >
      <Icon data={faRotateRight} />
      <span class="sr-only">Repeat</span>
    </button>
    <button
      class="btn btn-icon hover:variant-soft-secondary"
      title="Edit"
      on:click={handleUpdateClick}
    >
      <Icon data={faPencil} />
      <span class="sr-only">Edit</span>
    </button>
  </span>
</div>
