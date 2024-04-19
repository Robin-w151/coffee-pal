<script lang="ts" context="module">
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
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability';
  import { syncStateStore } from '$lib/stores/syncState';
  import { sync } from '$lib/utils/sync';
  import { scrollToTop } from '$lib/utils/ui/scroll';
  import {
    faArrowUpAZ,
    faArrowUpZA,
    faCalendarDays,
    faCheck,
    type IconDefinition,
  } from '@fortawesome/free-solid-svg-icons';
  import { ListBox, ListBoxItem, Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';
  import PageActions from '../shared/elements/page/PageActions.svelte';
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageSearch from '../shared/elements/page/PageSearch.svelte';
  import JournalEntries from './list/JournalEntries.svelte';
  import JournalEntriesTable from './table/JournalEntriesTable.svelte';

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

  let selectedSortOption = getActiveSortOption().label;
  let innerWidth = 0;

  $: paginationSettings = getPaginationSettings($journalStore);

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

  function handleSearchChange({ detail: searchInput }: CustomEvent<string>): void {
    journalSearchStore.setFilter(searchInput);
  }

  function handleSortOptionClick(sort: JournalSort, sortDirection: JournalSortDirection): void {
    journalSearchStore.setSort(sort, sortDirection);
  }

  function handlePageChange({ detail: page }: CustomEvent<number>): void {
    journalStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto('journal/new');
  }

  function handleSyncClick(): void {
    sync();
  }
</script>

<svelte:window bind:innerWidth />

<PageActions
  isSyncEnabled={$syncAvailabilityStore.isAvailable}
  isSynchronizing={$syncStateStore.isSynchronizing}
  on:add={handleAddClick}
  on:synchronize={handleSyncClick}
/>
<PageSearch
  title="Brewing Journal"
  search={$journalSearchStore.filter}
  isLoading={$journalStore.isLoading}
  on:searchChange={handleSearchChange}
>
  <ListBox slot="popup">
    {#each sortOptions as { label, icon, sort, sortDirection }}
      <ListBoxItem
        name={label}
        value={label}
        bind:group={selectedSortOption}
        on:click={() => handleSortOptionClick(sort, sortDirection)}
      >
        <div class="flex justify-between items-center gap-4 w-full min-w-36">
          <div class="flex items-center gap-2">
            <Icon data={icon} />
            <span>{label}</span>
          </div>
          {#if $journalSearchStore.sort === sort && $journalSearchStore.sortDirection === sortDirection}
            <Icon data={faCheck} />
          {/if}
        </div>
      </ListBoxItem>
    {/each}
  </ListBox>
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
