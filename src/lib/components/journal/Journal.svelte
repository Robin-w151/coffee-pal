<script lang="ts">
  import type { ActiveJournalEntry, JournalEntryAction } from '$lib/models/journal';
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { sync } from '$lib/utils/sync';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { ToastHelper } from '$lib/utils/ui/toast';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { onDestroy } from 'svelte';
  import { v4 as uuid } from 'uuid';
  import PageActions from '../ui/elements/page/PageActions.svelte';
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageSearch from '../ui/elements/page/PageSearch.svelte';
  import JournalEntries from './JournalEntries.svelte';
  import JournalEntryModal from './JournalEntryModal.svelte';

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

  function handleModalEntryAdd(value: JournalEntryAction): void {
    if (value.action === 'save') {
      journalStore.add(value.payload as ActiveJournalEntry);
    }
  }

  function handleEntrySave({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    journalStore.update(entry);
  }

  function handleEntryCopy({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    journalStore.add({ ...entry, id: uuid() });
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
  title="Brewing Journal"
  sort={$journalSearchStore.sort}
  isLoading={$journalStore.isLoading}
  on:searchChange={handleSearchChange}
  on:sortToggle={handleSortToggle}
/>
<PageCard class="page-with-actions-token">
  <JournalEntries
    {...$journalStore}
    on:save={handleEntrySave}
    on:copy={handleEntryCopy}
    on:remove={handleEntryRemove}
  />
</PageCard>
