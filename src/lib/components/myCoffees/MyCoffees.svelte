<script lang="ts" context="module">
  import { screens } from '$lib/config/screens';

  const screenMd = parseInt(screens.md);
</script>

<script lang="ts">
  import { goto } from '$app/navigation';
  import { MY_COFFEES_PAGE_SIZE } from '$lib/config/myCoffees';
  import type { MyCoffeesState } from '$lib/models/myCoffees';
  import { myCoffeesSearchStore, myCoffeesStore } from '$lib/stores/myCoffees';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability';
  import { syncStateStore } from '$lib/stores/syncState';
  import { sync } from '$lib/utils/sync';
  import { scrollToTop } from '$lib/utils/ui/scroll';
  import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import PageActions from '../shared/elements/page/PageActions.svelte';
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageSearch from '../shared/elements/page/PageSearch.svelte';
  import CoffeeEntries from './list/CoffeeEntries.svelte';
  import CoffeeEntriesTable from './table/CoffeeEntriesTable.svelte';

  let innerWidth = 0;

  $: paginationSettings = getPaginationSettings($myCoffeesStore);

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

  function handleSortToggle(): void {
    myCoffeesSearchStore.setSort($myCoffeesSearchStore.sort === 'asc' ? 'desc' : 'asc');
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
  sort={$myCoffeesSearchStore.sort}
  isLoading={$myCoffeesStore.isLoading}
  on:searchChange={handleSearchChange}
  on:sortToggle={handleSortToggle}
/>
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
