<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import JournalEntryItem from './JournalEntryItem.svelte';
  import JournalEntryPlaceholder from './JournalEntryPlaceholder.svelte';

  export let entries: Array<ActiveJournalEntry>;
  export let isLoading = false;

  function hasEntries(entries?: Array<ActiveJournalEntry>): boolean {
    return !!entries && entries.length > 0;
  }
</script>

<div class="overflow-auto">
  <table class="table {hasEntries(entries) ? 'table-interactive' : ''}">
    <thead>
      <tr>
        <th />
        <th>Method</th>
        <th>Coffee</th>
        <th>Recipe</th>
        <th>Temperature</th>
        <th>Grind settings</th>
      </tr>
    </thead>
    <tbody>
      {#if isLoading && !hasEntries(entries)}
        {#each { length: 5 } as _}
          <JournalEntryPlaceholder />
        {/each}
      {:else}
        {#each entries as entry (entry.id)}
          <JournalEntryItem {entry} />
        {:else}
          <tr>
            <td colspan="6">
              <div class="flex justify-center items-center gap-4 w-full">
                <Icon data={faFaceSadCry} />
                <span
                  >Could not find any entries. Get up, start brewing coffee and add your first
                  journal entry today!</span
                >
              </div>
            </td>
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>
