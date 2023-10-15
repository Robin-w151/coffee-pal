<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faEye } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let entry: ActiveCoffeeEntry;

  const dispatch = createEventDispatcher();

  function handleUpdateClick(): void {
    const copy = { ...entry, aromas: [...entry.aromas] };
    dispatch('update', copy);
  }

  function details(entry: ActiveCoffeeEntry): string {
    const { variety, trader } = entry;
    return [variety, trader].filter((s) => !!s).join(' | ');
  }
</script>

<div class="justify-between">
  <span class="block min-w-0 flex-1">
    <dt class="overflow-hidden text-ellipsis">
      <span class="font-bold">{entry.name} - {entry.origin || 'Unknown Origin'}</span>
    </dt>
    <dd class="overflow-hidden text-ellipsis">
      <span>{details(entry)}</span>
    </dd>
  </span>
  <span class="flex gap-2">
    <button
      class="btn btn-icon hover:variant-soft-secondary"
      title="Show"
      on:click={handleUpdateClick}
    >
      <Icon data={faEye} />
      <span class="sr-only">Show</span>
    </button>
  </span>
</div>
