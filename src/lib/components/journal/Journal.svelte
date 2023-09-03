<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { journalSearchStore, journalStore } from '$lib/stores/journal';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { triggerModal } from '$lib/utils/helper';
  import { sync } from '$lib/utils/sync';
  import { triggerInfo } from '$lib/utils/toast';
  import {
    faArrowUpAZ,
    faArrowUpZA,
    faPlus,
    faRotate,
    faSearch,
  } from '@fortawesome/free-solid-svg-icons';
  import { tick } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import PageCard from '../ui/elements/PageCard.svelte';
  import Spinner from '../ui/elements/Spinner.svelte';
  import { scaleX } from '../ui/transitions/scaleX';
  import JournalEntries from './JournalEntries.svelte';
  import JournalEntryModal from './JournalEntryModal.svelte';

  let searchInput = '';
  let searchInputRef: HTMLInputElement;
  let isSearchActive = false;

  $: handleSearchInputChange(searchInput);

  async function handleSearchClick(): Promise<void> {
    isSearchActive = true;
    await tick();
    searchInputRef.focus();
  }

  function handleSearchInputChange(searchInput: string): void {
    journalSearchStore.setFilter(searchInput);
  }

  function handleSearchInputBlur(): void {
    if (!searchInput) {
      isSearchActive = false;
    }
  }

  function handleSortClick(): void {
    journalSearchStore.setSort($journalSearchStore.sort === 'asc' ? 'desc' : 'asc');
  }

  function handleAddClick(): void {
    triggerModal(JournalEntryModal, { response: handleModalEntryAdd });
  }

  function handleSyncClick(): void {
    sync();
  }

  function handleModalEntryAdd(entry: ActiveJournalEntry): void {
    if (entry) {
      journalStore.add(entry);
    }
  }

  function handleEntryAdd({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    journalStore.add(entry);
  }

  function handleEntryUpdate({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    journalStore.update(entry);
  }

  function handleEntryRemove({ detail: id }: CustomEvent<string>): void {
    triggerInfo('Did you click to fast?', {
      timeout: 15000,
      action: {
        label: 'Undo',
        response: () => journalStore.undo(id),
      },
    });

    journalStore.remove(id);
  }
</script>

<div class="flex items-end gap-4 fixed z-10 bottom-8 right-8">
  {#if $syncStore.connection}
    <button
      class="btn btn-icon btn-icon-lg variant-filled-primary shadow-xl"
      on:click={handleSyncClick}
    >
      {#if $syncStateStore.isSynchronizing}
        <Spinner color="white" />
      {:else}
        <Icon data={faRotate} scale={1.25} />
        <span class="sr-only">Synchronize</span>
      {/if}
    </button>
  {/if}
  <button
    class="btn btn-icon btn-icon-xl variant-filled-primary shadow-xl"
    on:click={handleAddClick}
  >
    <Icon data={faPlus} scale={1.5} />
    <span class="sr-only">Add</span>
  </button>
</div>

<header class="flex justify-between items-center gap-4 px-2 w-full h-12">
  <h2 class="h2">Brewing Journal</h2>
  <div class="grid grid-cols-[auto_max-content] items-center gap-2">
    {#if isSearchActive}
      <input
        class="input variant-ghost-secondary"
        type="text"
        placeholder="Search..."
        bind:value={searchInput}
        bind:this={searchInputRef}
        on:blur={handleSearchInputBlur}
        in:scaleX={{ direction: 'left', duration: 250 }}
      />
    {:else}
      <button class="page-header-button-token" on:click={handleSearchClick}>
        <Icon data={faSearch} />
      </button>
    {/if}
    <button class="page-header-button-token" on:click={handleSortClick}>
      {#if $journalSearchStore.sort === 'asc'}
        <Icon data={faArrowUpAZ} />
      {:else}
        <Icon data={faArrowUpZA} />
      {/if}
    </button>
  </div>
</header>
<PageCard class="page-with-actions-token">
  <JournalEntries
    {...$journalStore}
    on:add={handleEntryAdd}
    on:update={handleEntryUpdate}
    on:remove={handleEntryRemove}
  />
</PageCard>
