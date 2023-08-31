<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faPencil } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let entry: ActiveCoffeeEntry;

  const dispatch = createEventDispatcher();

  function handleUpdateClick(): void {
    const copy = { ...entry };
    dispatch('update', copy);
  }
</script>

<div class="justify-between">
  <span class="block min-w-0 flex-1">
    <dt class="overflow-hidden text-ellipsis">
      <span class="font-bold">{entry.name} - {entry.origin || 'Unknown Origin'}</span>
    </dt>
    <dd class="overflow-hidden text-ellipsis">
      <span>{entry.trader || 'Unknown Trader'}</span>
    </dd>
  </span>
  <span class="flex gap-2">
    <button class="btn btn-icon hover:variant-soft-secondary" on:click={handleUpdateClick}>
      <Icon data={faPencil} />
      <span class="sr-only">Edit</span>
    </button>
  </span>
</div>
