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
  import type { JournalSort, JournalSortDirection, JournalState } from '$lib/models/journal';
  import { sync } from '$lib/services/sync/sync';
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import { syncStateStore } from '$lib/stores/syncState.svelte';
  import { scrollToTop } from '$lib/shared/ui/scroll';
  import {
    faArrowUpAZ,
    faArrowUpZA,
    faCalendarDays,
    faCheck,
    faStar,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
  import { ListBox, ListBoxItem, Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';
  import PageActions from '../shared/elements/page/PageActions.svelte';
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageSearch from '../shared/elements/page/PageSearch.svelte';
  import JournalEntries from './list/JournalEntries.svelte';
  import JournalEntriesTable from './table/JournalEntriesTable.svelte';
  import { syncStore } from '$lib/stores/sync';
  import { resolve } from '$app/paths';

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
  let paginationSettings = $derived(getPaginationSettings($journalStore));

  function getActiveSortOption(): SortOption {
    return (
      sortOptions.find(
        ({ sort, sortDirection }) =>
          $journalSearchStore.sort === sort && $journalSearchStore.sortDirection === sortDirection,
      ) ?? sortOptions[0]
    );
  }

  function getPaginationSettings({ page, totalEntries }: JournalState): PaginationSettings {
    return {
      page,
      limit: JOURNAL_PAGE_SIZE,
      size: totalEntries,
      amounts: [],
    };
  }

  function handleSearchChange(searchInput?: string | null): void {
    journalSearchStore.setFilter(searchInput ?? '');
  }

  function handleSortOptionClick(sort: JournalSort, sortDirection: JournalSortDirection): void {
    journalSearchStore.setSort(sort, sortDirection);
  }

  function handlePageChange({ detail: page }: CustomEvent<number>): void {
    journalStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto(resolve('./journal/new', {}));
  }

  function handleSyncClick(): void {
    sync();
  }
</script>

<svelte:window bind:innerWidth />

<PageActions
  isSyncEnabled={$syncAvailabilityStore.isAvailable}
  isSynchronizing={syncStateStore.isSynchronizing}
  lastSync={$syncStore.connection?.lastSync}
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
    <ListBox>
      {#each sortOptions as { label, icon, sort, sortDirection } (label)}
        <ListBoxItem
          name={label}
          value={label}
          bind:group={selectedSortOption}
          on:click={() => handleSortOptionClick(sort, sortDirection)}
        >
          <div class="flex justify-between items-center gap-4 w-full min-w-48">
            <div class="flex items-center gap-2">
              <Icon data={icon} />
              <span>{label}</span>
            </div>
            {#if selectedSortOption === label}
              <Icon data={faCheck} />
            {/if}
          </div>
        </ListBoxItem>
      {/each}
    </ListBox>
  {/snippet}
</PageSearch>
<PageCard class="page-with-actions-token">
  {#if innerWidth > screenMd}
    <JournalEntriesTable entries={$journalStore.entries} isLoading={$journalStore.isLoading} />
  {:else}
    <JournalEntries entries={$journalStore.entries} isLoading={$journalStore.isLoading} />
  {/if}
  {#if $journalStore.totalEntries}
    <Paginator
      settings={paginationSettings}
      showFirstLastButtons
      showPreviousNextButtons
      justify="justify-center"
      on:page={handlePageChange}
    />
  {/if}
</PageCard>
