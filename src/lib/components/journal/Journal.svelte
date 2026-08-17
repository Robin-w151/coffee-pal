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
  import Paginator from '../shared/elements/Paginator.svelte';
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

  function handleSortOptionClick(
    label: string,
    sort: JournalSort,
    sortDirection: JournalSortDirection,
  ): void {
    selectedSortOption = label;
    journalSearchStore.setSort(sort, sortDirection);
  }

  function handlePageChange(page: number): void {
    journalStore.loadPage(page);
    scrollToTop();
  }

  function handleAddClick(): void {
    goto(resolve('/journal/new', {}));
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
  {#snippet popupContent(closePopup: () => void)}
    <ul class="flex flex-col gap-1" role="listbox">
      {#each sortOptions as { label, icon, sort, sortDirection } (label)}
        <li role="presentation">
          <button
            type="button"
            role="option"
            class="btn justify-start w-full {selectedSortOption === label
              ? 'preset-filled-primary-500'
              : 'hover:preset-tonal'}"
            aria-selected={selectedSortOption === label}
            onclick={() => {
              handleSortOptionClick(label, sort, sortDirection);
              closePopup();
            }}
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
          </button>
        </li>
      {/each}
    </ul>
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
      page={$journalStore.page}
      pageSize={JOURNAL_PAGE_SIZE}
      count={$journalStore.totalEntries}
      onPageChange={handlePageChange}
    />
  {/if}
</PageCard>
