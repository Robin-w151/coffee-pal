<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { triggerModal } from '$lib/utils/helper';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import CoffeeEntryItem from './CoffeeEntryItem.svelte';
  import CoffeeEntryModal from './CoffeeEntryModal.svelte';
  import CoffeeEntryPlaceholder from './CoffeeEntryPlaceholder.svelte';

  export let activeEntries: Array<ActiveCoffeeEntry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();

  function handleUpdateEntry({ detail: entry }: CustomEvent<ActiveCoffeeEntry>): void {
    triggerModal(CoffeeEntryModal, { props: { entry, edit: true }, response: handleEntryChange });
  }

  function handleEntryChange(value: ActiveCoffeeEntry | string): void {
    if (typeof value === 'object') {
      dispatch('update', value);
    }

    if (typeof value === 'string') {
      dispatch('remove', value);
    }
  }
</script>

<dl class="list-dl">
  {#if isLoading}
    <CoffeeEntryPlaceholder />
    <CoffeeEntryPlaceholder />
    <CoffeeEntryPlaceholder />
  {:else}
    {#each activeEntries as entry (entry.id)}
      <CoffeeEntryItem {entry} on:update={handleUpdateEntry} />
    {:else}
      <p class="flex justify-center items-center gap-4">
        <span class="flex items-center">
          <Icon data={faFaceSadCry} />
        </span>
        <span
          >Could not find any coffees. Get up, buy your favorite bag of coffee and add your first
          entry today!</span
        >
      </p>
    {/each}
  {/if}
</dl>
