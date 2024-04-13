<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import JournalEntryItem from './JournalEntryItem.svelte';
  import JournalEntryPlaceholder from './JournalEntryPlaceholder.svelte';

  export let entries: Array<ActiveJournalEntry>;
  export let isLoading = false;
</script>

<dl class="list-dl">
  {#if isLoading && (!entries || entries.length === 0)}
    <JournalEntryPlaceholder />
    <JournalEntryPlaceholder />
    <JournalEntryPlaceholder />
  {:else}
    {#each entries as entry (entry.id)}
      <JournalEntryItem {entry} />
    {:else}
      <p class="flex justify-center items-center gap-4">
        <span class="flex items-center">
          <Icon data={faFaceSadCry} />
        </span>
        <span
          >Could not find any entries. Get up, start brewing coffee and add your first journal entry
          today!</span
        >
      </p>
    {/each}
  {/if}
</dl>
