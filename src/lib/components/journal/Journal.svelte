<script lang="ts" context="module">
  interface SortOption {
    label: string;
    icon: IconDefinition;
    sort: JournalSort;
    sortDirection: JournalSortDirection;
  }
</script>

<script lang="ts">
  import type {
    ActiveJournalEntry,
    JournalEntryAction,
    JournalSort,
    JournalSortDirection,
  } from '$lib/models/journal';
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability';
  import { syncStateStore } from '$lib/stores/syncState';
  import { sync } from '$lib/utils/sync';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { ToastHelper } from '$lib/utils/ui/toast';
  import {
    faArrowUpAZ,
    faArrowUpZA,
    faCalendarDays,
    faCheck,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { onDestroy } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import PageActions from '../ui/elements/page/PageActions.svelte';
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageSearch from '../ui/elements/page/PageSearch.svelte';
  import JournalEntries from './JournalEntries.svelte';
  import JournalEntryModal from './JournalEntryModal.svelte';

  const modalHelper = new ModalHelper(getModalStore());
  const toastHelper = new ToastHelper(getToastStore());
  const sortOptions = [
    {
      label: 'Latest',
      icon: faCalendarDays,
      sort: 'updated_at',
      sortDirection: 'desc',
    },
    {
      label: 'A-Z',
      icon: faArrowUpAZ,
      sort: 'title',
      sortDirection: 'asc',
    },
    {
      label: 'Z-A',
      icon: faArrowUpZA,
      sort: 'title',
      sortDirection: 'desc',
    },
  ] satisfies Array<SortOption>;

  onDestroy(() => {
    journalSearchStore.reset();
  });

  function handleSearchChange({ detail: searchInput }: CustomEvent<string>): void {
    journalSearchStore.setFilter(searchInput);
  }

  function handleSortOptionClick(sort: JournalSort, sortDirection: JournalSortDirection): void {
    journalSearchStore.setSort(sort, sortDirection);
  }

  function handleAddClick(): void {
    modalHelper.triggerModal(JournalEntryModal, { response: handleModalEntryAdd });
  }

  function handleSyncClick(): void {
    sync();
  }

  function handleModalEntryAdd(value: JournalEntryAction): void {
    if (value?.action === 'save') {
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
  isSyncEnabled={$syncAvailabilityStore.isAvailable}
  isSynchronizing={$syncStateStore.isSynchronizing}
  on:add={handleAddClick}
  on:synchronize={handleSyncClick}
/>
<PageSearch
  title="Brewing Journal"
  isLoading={$journalStore.isLoading}
  on:searchChange={handleSearchChange}
>
  <div class="flex flex-col items-start gap-2" slot="popup">
    {#each sortOptions as { label, icon, sort, sortDirection }}
      <button
        class="btn btn-sm variant-filled flex justify-between items-center gap-4 p-4 w-full min-w-36"
        on:click={() => handleSortOptionClick(sort, sortDirection)}
      >
        <div class="flex items-center gap-2">
          <Icon data={icon} />
          <span>{label}</span>
        </div>
        {#if $journalSearchStore.sort === sort && $journalSearchStore.sortDirection === sortDirection}
          <Icon data={faCheck} />
        {/if}
      </button>
    {/each}
  </div>
</PageSearch>
<PageCard class="page-with-actions-token">
  <JournalEntries
    {...$journalStore}
    on:save={handleEntrySave}
    on:copy={handleEntryCopy}
    on:remove={handleEntryRemove}
  />
</PageCard>
