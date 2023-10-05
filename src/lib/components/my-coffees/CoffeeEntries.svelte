<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import CoffeeEntryItem from './CoffeeEntryItem.svelte';
  import CoffeeEntryModal from './CoffeeEntryModal.svelte';
  import CoffeeEntryPlaceholder from './CoffeeEntryPlaceholder.svelte';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { MY_COFFEES_BATCH_SIZE } from '$lib/config/myCoffees';
  import { infiniteScrollAction } from 'svelte-legos';

  export let activeEntries: Array<ActiveCoffeeEntry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();
  const modalHelper = new ModalHelper(getModalStore());

  let batchCount = 1;

  $: handleActiveEntriesChange(activeEntries);
  $: displayedActiveEntries = activeEntries.slice(0, MY_COFFEES_BATCH_SIZE * batchCount);

  function handleActiveEntriesChange(activeEntries: Array<ActiveCoffeeEntry>): void {
    batchCount = 1;
  }

  function handleScrollToBottom(): void {
    if (displayedActiveEntries.length < activeEntries.length) {
      batchCount += 1;
    }
  }

  function handleUpdateEntry({ detail: entry }: CustomEvent<ActiveCoffeeEntry>): void {
    modalHelper.triggerModal(CoffeeEntryModal, {
      props: { entry, edit: true },
      response: handleEntryChange,
    });
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

<dl class="list-dl" use:infiniteScrollAction={{ distance: 500, cb: handleScrollToBottom }}>
  {#if isLoading && (!displayedActiveEntries || displayedActiveEntries.length === 0)}
    <CoffeeEntryPlaceholder />
    <CoffeeEntryPlaceholder />
    <CoffeeEntryPlaceholder />
  {:else}
    {#each displayedActiveEntries as entry (entry.id)}
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
