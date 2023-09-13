<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesSearchStore, myCoffeesStore } from '$lib/stores/myCoffees';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { ModalHelper } from '$lib/utils/modal';
  import { sync } from '$lib/utils/sync';
  import { ToastHelper } from '$lib/utils/toast';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import PageActions from '../ui/elements/PageActions.svelte';
  import PageCard from '../ui/elements/PageCard.svelte';
  import PageSearch from '../ui/elements/PageSearch.svelte';
  import CoffeeEntries from './CoffeeEntries.svelte';
  import CoffeeEntryModal from './CoffeeEntryModal.svelte';

  const modalHelper = new ModalHelper(getModalStore());
  const toastHelper = new ToastHelper(getToastStore());

  function handleSearchChange({ detail: searchInput }: CustomEvent<string>): void {
    myCoffeesSearchStore.setFilter(searchInput);
  }

  function handleSortToggle(): void {
    myCoffeesSearchStore.setSort($myCoffeesSearchStore.sort === 'asc' ? 'desc' : 'asc');
  }

  function handleAddClick(): void {
    modalHelper.triggerModal(CoffeeEntryModal, { response: handleModalEntryAdd });
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
    toastHelper.triggerInfo('Did you click to fast?', {
      timeout: 15000,
      action: {
        label: 'Undo',
        response: () => myCoffeesStore.undo(id),
      },
    });

    myCoffeesStore.remove(id);
  }
</script>

<PageActions
  isSyncEnabled={!!$syncStore.connection}
  isSynchronizing={$syncStateStore.isSynchronizing}
  on:add={handleAddClick}
  on:synchronize={handleSyncClick}
/>
<PageSearch
  title="My Coffees"
  sort={$myCoffeesSearchStore.sort}
  on:searchChange={handleSearchChange}
  on:sortToggle={handleSortToggle}
/>
<PageCard class="page-with-actions-token">
  <CoffeeEntries {...$myCoffeesStore} on:update={handleEntryUpdate} on:remove={handleEntryRemove} />
</PageCard>
