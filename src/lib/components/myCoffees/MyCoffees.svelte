<script lang="ts" context="module">
  import { screens } from '$lib/config/screens';

  interface SortOption {
    label: string;
    icon: IconDefinition;
    sort: MyCoffeesSort;
    sortDirection: MyCoffeesSortDirection;
  }

  const screenMd = parseInt(screens.md);
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { MY_COFFEES_PAGE_SIZE } from '$lib/config/myCoffees';
  import type {
    MyCoffeesSort,
    MyCoffeesSortDirection,
    MyCoffeesState,
  } from '$lib/models/myCoffees';
  import { sync } from '$lib/services/sync/sync';
  import { myCoffeesSearchStore, myCoffeesStore } from '$lib/stores/myCoffees';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability';
  import { syncStateStore } from '$lib/stores/syncState';
  import { scrollToTop } from '$lib/shared/ui/scroll';
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
  import CoffeeEntries from './list/CoffeeEntries.svelte';
  import CoffeeEntriesTable from './table/CoffeeEntriesTable.svelte';

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
      sort: 'name_origin',
      sortDirection: 'asc',
    },
    {
      label: 'Z-A',
      icon: faArrowUpZA,
      sort: 'name_origin',
      sortDirection: 'desc',
    },
  ] satisfies Array<SortOption>;

  let selectedSortOption = getActiveSortOption().label;
  let innerWidth = 0;

  $: paginationSettings = getPaginationSettings($myCoffeesStore);

  function getActiveSortOption(): SortOption {
    return (
      sortOptions.find(
        ({ sort, sortDirection }) =>
          $myCoffeesSearchStore.sort === sort &&
          $myCoffeesSearchStore.sortDirection === sortDirection,
      ) ?? sortOptions[0]
    );
  }

  function getPaginationSettings({ page, totalEntries }: MyCoffeesState): PaginationSettings {
    return {
      page,
      limit: MY_COFFEES_PAGE_SIZE,
      size: totalEntries,
      amounts: [],
    };
  }

  function handleSearchChange({ detail: searchInput }: CustomEvent<string>): void {
    myCoffeesSearchStore.setFilter(searchInput);
  }

  function handleSortOptionClick(sort: MyCoffeesSort, sortDirection: MyCoffeesSortDirection): void {
    myCoffeesSearchStore.setSort(sort, sortDirection);
  }

  function handlePageChange({ detail: page }: CustomEvent<number>): void {
    myCoffeesStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto('/my-coffees/new');
  }

  function handleSyncClick(): void {
    sync();
  }
</script>

<svelte:window bind:innerWidth />

<PageSearch
  title="My Coffees"
  search={$myCoffeesSearchStore.filter}
  isLoading={$myCoffeesStore.isLoading}
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
          {#if selectedSortOption === label}
            <Icon data={faCheck} />
          {/if}
        </div>
      </ListBoxItem>
    {/each}
  </ListBox>
</PageSearch>
<PageActions
  isSyncEnabled={$syncAvailabilityStore.isAvailable}
  isSynchronizing={$syncStateStore.isSynchronizing}
  on:add={handleAddClick}
  on:synchronize={handleSyncClick}
/>
<PageCard class="page-with-actions-token">
  {#if innerWidth > screenMd}
    <CoffeeEntriesTable entries={$myCoffeesStore.entries} isLoading={$myCoffeesStore.isLoading} />
  {:else}
    <CoffeeEntries entries={$myCoffeesStore.entries} isLoading={$myCoffeesStore.isLoading} />
  {/if}
  {#if $myCoffeesStore.totalEntries}
    <Paginator
      settings={paginationSettings}
      showFirstLastButtons
      showPreviousNextButtons
      justify="justify-center"
      on:page={handlePageChange}
    />
  {/if}
</PageCard>
