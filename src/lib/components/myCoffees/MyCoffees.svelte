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
  import type { MyCoffeesSort, MyCoffeesSortDirection } from '$lib/models/myCoffees';
  import { sync } from '$lib/services/sync/sync';
  import { myCoffeesSearchStore, myCoffeesStore } from '$lib/stores/myCoffees';
  import { getSyncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import { syncStateStore } from '$lib/stores/syncState.svelte';
  import { scrollToTop } from '$lib/shared/ui/scroll';
  import {
    faArrowUp19,
    faArrowUp91,
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
  import CoffeeEntries from './list/CoffeeEntries.svelte';
  import CoffeeEntriesTable from './table/CoffeeEntriesTable.svelte';
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

  function getActiveSortOption(): SortOption {
    return (
      sortOptions.find(
        ({ sort, sortDirection }) =>
          $myCoffeesSearchStore.sort === sort &&
          $myCoffeesSearchStore.sortDirection === sortDirection,
      ) ?? sortOptions[0]
    );
  }

  function handleSearchChange(searchInput?: string | null): void {
    myCoffeesSearchStore.setFilter(searchInput ?? '');
  }

  function handleSortOptionClick(sort: MyCoffeesSort, sortDirection: MyCoffeesSortDirection): void {
    myCoffeesSearchStore.setSort(sort, sortDirection);
  }

  function handleSortOptionSelect(label: string): void {
    const option = sortOptions.find((sortOption) => sortOption.label === label);
    if (option) {
      handleSortOptionClick(option.sort, option.sortDirection);
    }
  }

  function handlePageChange(page: number): void {
    myCoffeesStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto(resolve('/my-coffees/new', {}));
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
  title="My Coffees"
  search={$myCoffeesSearchStore.filter}
  isLoading={$myCoffeesStore.isLoading}
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
    <CoffeeEntriesTable entries={$myCoffeesStore.entries} isLoading={$myCoffeesStore.isLoading} />
  {:else}
    <CoffeeEntries entries={$myCoffeesStore.entries} isLoading={$myCoffeesStore.isLoading} />
  {/if}
  {#if $myCoffeesStore.totalEntries}
    <Pagination
      page={$myCoffeesStore.page}
      pageSize={MY_COFFEES_PAGE_SIZE}
      total={$myCoffeesStore.totalEntries}
      onPageChange={handlePageChange}
    />
  {/if}
</PageCard>
