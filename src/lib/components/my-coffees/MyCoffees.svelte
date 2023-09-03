<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { triggerModal } from '$lib/utils/helper';
  import { sync } from '$lib/utils/sync';
  import { triggerInfo } from '$lib/utils/toast';
  import { faPlus, faRotate } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import Spinner from '../ui/elements/Spinner.svelte';
  import CoffeeEntries from './CoffeeEntries.svelte';
  import CoffeeEntryModal from './CoffeeEntryModal.svelte';
  import PageCard from '../ui/elements/PageCard.svelte';

  function handleAddClick(): void {
    triggerModal(CoffeeEntryModal, { response: handleModalEntryAdd });
  }

  function handleSyncClick(): void {
    sync();
  }

  function handleModalEntryAdd(entry: ActiveCoffeeEntry): void {
    if (entry) {
      myCoffeesStore.add(entry);
    }
  }

  function handleEntryUpdate({ detail: entry }: CustomEvent<ActiveCoffeeEntry>): void {
    myCoffeesStore.update(entry);
  }

  function handleEntryRemove({ detail: id }: CustomEvent<string>): void {
    triggerInfo('Did you click to fast?', {
      timeout: 15000,
      action: {
        label: 'Undo',
        response: () => myCoffeesStore.undo(id),
      },
    });

    myCoffeesStore.remove(id);
  }
</script>

<div class="page-actions-token">
  {#if $syncStore.connection}
    <button
      class="btn btn-icon btn-icon-lg variant-filled-primary shadow-xl"
      on:click={handleSyncClick}
    >
      {#if $syncStateStore.isSynchronizing}
        <Spinner color="white" />
      {:else}
        <Icon data={faRotate} scale={1.25} />
        <span class="sr-only">Synchronize</span>
      {/if}
    </button>
  {/if}
  <button
    class="btn btn-icon btn-icon-xl variant-filled-primary shadow-xl"
    on:click={handleAddClick}
  >
    <Icon data={faPlus} scale={1.5} />
    <span class="sr-only">Add</span>
  </button>
</div>

<h2 class="h2">My Coffees</h2>
<PageCard class="page-with-actions-token">
  <CoffeeEntries {...$myCoffeesStore} on:update={handleEntryUpdate} on:remove={handleEntryRemove} />
</PageCard>
