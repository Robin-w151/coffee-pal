<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { calculateRatio } from '$lib/utils/math';
  import { faPencil, faRotateRight } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';

  export let entry: ActiveJournalEntry;

  const dispatch = createEventDispatcher();

  function handleCopyClick(): void {
    const copy = { ...entry, id: uuid() };
    dispatch('copy', copy);
  }

  function handleUpdateClick(): void {
    dispatch('update', entry);
  }

  function details(entry: ActiveJournalEntry): string {
    const { water, coffee, waterTemperature, grindSettings, description } = entry;
    const amountsStr = `${water}g/${coffee}g`;
    const waterTemperatureStr = waterTemperature ? `${waterTemperature} °C` : undefined;

    return [amountsStr, waterTemperatureStr, grindSettings, description]
      .filter((s) => !!s)
      .join(' | ');
  }
</script>

<div class="justify-between">
  <span class="badge variant-soft-tertiary w-16"
    >{calculateRatio(entry.coffee, entry.water) ?? 'unknown'}</span
  >
  <span class="block min-w-0 flex-1">
    <dt class="overflow-hidden text-ellipsis">
      <span class="font-bold">{entry.method} - {entry.coffeeType || 'Unknown'}</span>
    </dt>
    <dd class="overflow-hidden text-ellipsis">
      <span>{details(entry)}</span>
    </dd>
  </span>
  <span class="flex gap-2">
    <button class="btn btn-icon hover:variant-soft-secondary" on:click={handleCopyClick}>
      <Icon data={faRotateRight} />
      <span class="sr-only">Repeat</span>
    </button>
    <button class="btn btn-icon hover:variant-soft-secondary" on:click={handleUpdateClick}>
      <Icon data={faPencil} />
      <span class="sr-only">Edit</span>
    </button>
  </span>
</div>
