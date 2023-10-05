<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { sync } from '$lib/utils/sync';
  import { ToastHelper } from '$lib/utils/ui/toast';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import PageActions from '../ui/elements/page/PageActions.svelte';
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageSearch from '../ui/elements/page/PageSearch.svelte';
  import JournalEntries from './JournalEntries.svelte';
  import JournalEntryModal from './JournalEntryModal.svelte';
  import { onDestroy } from 'svelte';

  const modalHelper = new ModalHelper(getModalStore());
  const toastHelper = new ToastHelper(getToastStore());

  onDestroy(() => {
    journalSearchStore.reset();
  });

  function handleSearchChange({ detail: searchInput }: CustomEvent<string>): void {
    journalSearchStore.setFilter(searchInput);
  }

  function handleSortToggle(): void {
    journalSearchStore.setSort($journalSearchStore.sort === 'asc' ? 'desc' : 'asc');
  }

  function handleAddClick(): void {
    modalHelper.triggerModal(JournalEntryModal, { response: handleModalEntryAdd });
  }

  function handleSyncClick(): void {
    sync();
  }

  function handleModalEntryAdd(entry: ActiveJournalEntry): void {
    if (entry) {
      journalStore.add(entry);
    }
  }

  function handleEntryAdd({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    journalStore.add(entry);
  }

  function handleEntryUpdate({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    journalStore.update(entry);
  }

  function handleEntryRemove({ detail: id }: CustomEvent<string>): void {
    toastHelper.triggerInfo('Did you click to fast?', {
      timeout: 15000,
      action: {
        label: 'Undo',
        response: () => journalStore.undo(id),
      },
    });

    journalStore.remove(id);
  }
</script>

<PageActions
  isSyncEnabled={!!$syncStore.connection}
  isSynchronizing={$syncStateStore.isSynchronizing}
  on:add={handleAddClick}
  on:synchronize={handleSyncClick}
/>
<PageSearch
  title="Brewing Journal ({$journalStore.activeEntries.length})"
  sort={$journalSearchStore.sort}
  on:searchChange={handleSearchChange}
  on:sortToggle={handleSortToggle}
/>
<PageCard class="page-with-actions-token">
  <JournalEntries
    {...$journalStore}
    on:add={handleEntryAdd}
    on:update={handleEntryUpdate}
    on:remove={handleEntryRemove}
  />
</PageCard>
