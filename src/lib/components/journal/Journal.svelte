<script lang="ts" module>
  import { screens } from '$lib/config/screens';

  interface SortOption {
    label: string;
    icon: IconDefinition;
    sort: JournalSort;
    sortDirection: JournalSortDirection;
  }

  const screenMd = parseInt(screens.md);
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { JOURNAL_PAGE_SIZE } from '$lib/config/journal';
  import type { JournalSort, JournalSortDirection } from '$lib/models/journal';
  import { sync } from '$lib/services/sync/sync';
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { getSyncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import { syncStateStore } from '$lib/stores/syncState.svelte';
  import { scrollToTop } from '$lib/shared/ui/scroll';
  import {
    faArrowUpAZ,
    faArrowUpZA,
    faCalendarDays,
    faStar,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
  import Listbox from '$lib/components/ui/Listbox.svelte';
  import Pagination from '$lib/components/ui/Pagination.svelte';
  import PageActions from '../shared/elements/page/PageActions.svelte';
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageSearch from '../shared/elements/page/PageSearch.svelte';
  import JournalEntries from './list/JournalEntries.svelte';
  import JournalEntriesTable from './table/JournalEntriesTable.svelte';
  import { getSyncStore } from '$lib/stores/sync.svelte';
  import { resolve } from '$app/paths';

  const syncStore = getSyncStore();
  const syncAvailabilityStore = getSyncAvailabilityStore();

  const sortOptions = [
    {
      label: 'Recently Added',
      icon: faCalendarDays,
      sort: 'created_at',
      sortDirection: 'desc',
    },
    {
      label: 'Recently Updated',
      icon: faCalendarDays,
      sort: 'updated_at',
      sortDirection: 'desc',
    },
    {
      label: 'Best',
      icon: faStar,
      sort: 'rating',
      sortDirection: 'desc',
    },
    {
      label: 'A-Z',
      icon: faArrowUpAZ,
      sort: 'method_coffee_type',
      sortDirection: 'asc',
    },
    {
      label: 'Z-A',
      icon: faArrowUpZA,
      sort: 'method_coffee_type',
      sortDirection: 'desc',
    },
  ] satisfies Array<SortOption>;

  let selectedSortOption = $state(getActiveSortOption().label);
  let innerWidth = $state(0);

  function getActiveSortOption(): SortOption {
    return (
      sortOptions.find(
        ({ sort, sortDirection }) =>
          $journalSearchStore.sort === sort && $journalSearchStore.sortDirection === sortDirection,
      ) ?? sortOptions[0]
    );
  }

  function handleSearchChange(searchInput?: string | null): void {
    journalSearchStore.setFilter(searchInput ?? '');
  }

  function handleSortOptionClick(sort: JournalSort, sortDirection: JournalSortDirection): void {
    journalSearchStore.setSort(sort, sortDirection);
  }

  function handleSortOptionSelect(label: string): void {
    const option = sortOptions.find((sortOption) => sortOption.label === label);
    if (option) {
      handleSortOptionClick(option.sort, option.sortDirection);
    }
  }

  function handlePageChange(page: number): void {
    journalStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto(resolve('/journal/new', {}));
  }

  function handleSyncClick(): void {
    sync(syncStore);
  }
</script>

<svelte:window bind:innerWidth />

<PageActions
  isSyncEnabled={syncAvailabilityStore.isAvailable}
  isSynchronizing={syncStateStore.isSynchronizing}
  lastSync={syncStore.connection?.lastSync}
  onAdd={handleAddClick}
  onSynchronize={handleSyncClick}
/>
<PageSearch
  title="Brewing Journal"
  search={$journalSearchStore.filter}
  isLoading={$journalStore.isLoading}
  onSearchChange={handleSearchChange}
>
  {#snippet popupContent()}
    <Listbox
      options={sortOptions.map(({ label, icon }) => ({ value: label, label, icon }))}
      bind:value={selectedSortOption}
      onSelect={handleSortOptionSelect}
    />
  {/snippet}
</PageSearch>
<PageCard class="page-with-actions-token">
  {#if innerWidth > screenMd}
    <JournalEntriesTable entries={$journalStore.entries} isLoading={$journalStore.isLoading} />
  {:else}
    <JournalEntries entries={$journalStore.entries} isLoading={$journalStore.isLoading} />
  {/if}
  {#if $journalStore.totalEntries}
    <Pagination
      page={$journalStore.page}
      pageSize={JOURNAL_PAGE_SIZE}
      total={$journalStore.totalEntries}
      onPageChange={handlePageChange}
    />
  {/if}
</PageCard>
