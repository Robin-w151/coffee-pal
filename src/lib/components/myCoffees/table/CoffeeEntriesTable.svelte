<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import CoffeeEntryItem from './CoffeeEntryItem.svelte';
  import CoffeeEntryPlaceholder from './CoffeeEntryPlaceholder.svelte';

  export let entries: Array<ActiveCoffeeEntry>;
  export let isLoading = false;

  function hasEntries(entries?: Array<ActiveCoffeeEntry>): boolean {
    return !!entries && entries.length > 0;
  }
</script>

<div class="overflow-auto">
  <table class="table {hasEntries(entries) ? 'table-interactive' : ''}">
    <thead>
      <tr>
        <th>Name</th>
        <th>Origin</th>
        <th>Process</th>
        <th>Variety</th>
        <th>Roaster</th>
        <th>Trader</th>
        <th>Aromas</th>
      </tr>
    </thead>
    <tbody>
      {#if isLoading && !hasEntries(entries)}
        {#each { length: 5 } as _}
          <CoffeeEntryPlaceholder />
        {/each}
      {:else}
        {#each entries as entry (entry.id)}
          <CoffeeEntryItem {entry} />
        {:else}
          <tr>
            <td colspan="7">
              <div class="flex justify-center items-center gap-4 w-full">
                <Icon data={faFaceSadCry} />
                <span
                  >Could not find any coffees. Get up, buy your favorite bag of coffee and add your
                  first entry today!</span
                >
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
