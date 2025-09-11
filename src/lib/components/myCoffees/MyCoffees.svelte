<script lang="ts" module>
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
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import { syncStateStore } from '$lib/stores/syncState.svelte';
  import { scrollToTop } from '$lib/shared/ui/scroll';
  import {
    faArrowUp19,
    faArrowUp91,
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
  import CoffeeEntries from './list/CoffeeEntries.svelte';
  import CoffeeEntriesTable from './table/CoffeeEntriesTable.svelte';
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
      sort: 'name_origin',
      sortDirection: 'asc',
    },
    {
      label: 'Z-A',
      icon: faArrowUpZA,
      sort: 'name_origin',
      sortDirection: 'desc',
    },
    {
      label: 'Low Altitude',
      icon: faArrowUp19,
      sort: 'altitude',
      sortDirection: 'asc',
    },
    {
      label: 'High Altitude',
      icon: faArrowUp91,
      sort: 'altitude',
      sortDirection: 'desc',
    },
  ] satisfies Array<SortOption>;

  let selectedSortOption = $state(getActiveSortOption().label);
  let innerWidth = $state(0);
  let paginationSettings = $derived(getPaginationSettings($myCoffeesStore));

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

  function handleSearchChange(searchInput?: string | null): void {
    myCoffeesSearchStore.setFilter(searchInput ?? '');
  }

  function handleSortOptionClick(sort: MyCoffeesSort, sortDirection: MyCoffeesSortDirection): void {
    myCoffeesSearchStore.setSort(sort, sortDirection);
  }

  function handlePageChange({ detail: page }: CustomEvent<number>): void {
    myCoffeesStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto(resolve(`/my-coffees/new`, {}));
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
  title="My Coffees"
  search={$myCoffeesSearchStore.filter}
  isLoading={$myCoffeesStore.isLoading}
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
