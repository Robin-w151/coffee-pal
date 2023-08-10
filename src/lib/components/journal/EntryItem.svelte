<script lang="ts">
  import type { Entry, JournalEntry } from '$lib/models/entry';
  import { calculateRatio } from '$lib/utils/math';
  import { faPencil } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let entry: JournalEntry;

  const dispatch = createEventDispatcher();

  function handleEditClick(): void {
    dispatch('edit', entry);
  }

  function details(entry: JournalEntry): string {
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
  <span class="flex gap-3">
    <button class="btn btn-icon hover:variant-soft-secondary" on:click={() => handleEditClick()}>
      <Icon data={faPencil} />
    </button>
  </span>
</div>
