<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import CoffeeEntryItem from './CoffeeEntryItem.svelte';
  import CoffeeEntryPlaceholder from './CoffeeEntryPlaceholder.svelte';

  interface Props {
    entries: Array<ActiveCoffeeEntry>;
    isLoading?: boolean;
  }

  let { entries, isLoading = false }: Props = $props();
</script>

<dl class="list-dl">
  {#if isLoading && (!entries || entries.length === 0)}
    {#each { length: 3 }}
      <CoffeeEntryPlaceholder />
    {/each}
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
