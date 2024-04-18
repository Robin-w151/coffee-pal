<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { Icon } from 'svelte-awesome';
  import CoffeeEntryPlaceholder from './CoffeeEntryPlaceholder.svelte';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import CoffeeEntryItem from './CoffeeEntryItem.svelte';

  export let entries: Array<ActiveCoffeeEntry>;
  export let totalEntries = 0;
  export let isLoading = false;
</script>

<table class="table table-interactive">
  <thead>
    <tr>
      <th>Name</th>
      <th>Origin</th>
      <th>Process</th>
      <th>Variety</th>
      <th>Trader</th>
      <th>Aromas</th>
    </tr>
  </thead>
  <tbody>
    {#if isLoading && (!entries || entries.length === 0)}
      <CoffeeEntryPlaceholder />
      <CoffeeEntryPlaceholder />
      <CoffeeEntryPlaceholder />
      <CoffeeEntryPlaceholder />
      <CoffeeEntryPlaceholder />
    {:else}
      {#each entries as entry (entry.id)}
        <CoffeeEntryItem {entry} />
      {:else}
        <tr>
          <td colspan="6">
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
  <tfoot>
    <tr>
      <th colspan="5">Total coffees: {totalEntries}</th>
    </tr>
  </tfoot>
</table>
