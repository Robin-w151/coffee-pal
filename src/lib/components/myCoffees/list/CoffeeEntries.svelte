<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { Paginator, type PaginationSettings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';
  import CoffeeEntryItem from './CoffeeEntryItem.svelte';
  import CoffeeEntryPlaceholder from './CoffeeEntryPlaceholder.svelte';

  export let entries: Array<ActiveCoffeeEntry>;
  export let totalEntries = 0;
  export let isLoading = false;
  export let paginationSettings: PaginationSettings;
</script>

<dl class="list-dl">
  {#if isLoading && (!entries || entries.length === 0)}
    <CoffeeEntryPlaceholder />
    <CoffeeEntryPlaceholder />
    <CoffeeEntryPlaceholder />
  {:else}
    {#each entries as entry (entry.id)}
      <CoffeeEntryItem {entry} />
    {:else}
      <p class="flex justify-center items-center gap-4">
        <span class="flex items-center">
          <Icon data={faFaceSadCry} />
        </span>
        <span
          >Could not find any coffees. Get up, buy your favorite bag of coffee and add your first
          entry today!</span
        >
      </p>
    {/each}
  {/if}
</dl>
{#if totalEntries}
  <Paginator
    settings={paginationSettings}
    showFirstLastButtons
    showPreviousNextButtons
    justify="justify-center"
    on:page
  />
{/if}
