<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import JournalEntryCellPlaceholder from './JournalEntryPlaceholder.svelte';
  import JournalEntryItem from './JournalEntryItem.svelte';

  export let entries: Array<ActiveJournalEntry>;
  export let totalEntries = 0;
  export let isLoading = false;
</script>

<table class="table table-interactive">
  <thead>
    <tr>
      <th>Method</th>
      <th>Coffee</th>
      <th>Ratio</th>
      <th>Temperature</th>
      <th>Grind settings</th>
    </tr>
  </thead>
  <tbody>
    {#if isLoading && (!entries || entries.length === 0)}
      <JournalEntryCellPlaceholder />
      <JournalEntryCellPlaceholder />
      <JournalEntryCellPlaceholder />
      <JournalEntryCellPlaceholder />
      <JournalEntryCellPlaceholder />
    {:else}
      {#each entries as entry (entry.id)}
        <JournalEntryItem {entry} />
      {:else}
        <tr>
          <td colspan="5">
            <div class="flex justify-center items-center gap-4 w-full">
              <Icon data={faFaceSadCry} />
              <span
                >Could not find any entries. Get up, start brewing coffee and add your first journal
                entry today!</span
              >
            </div>
          </td>
        </tr>
      {/each}
    {/if}
  </tbody>
  <tfoot>
    <tr>
      <th colspan="5">Total brews: {totalEntries}</th>
    </tr>
  </tfoot>
</table>
