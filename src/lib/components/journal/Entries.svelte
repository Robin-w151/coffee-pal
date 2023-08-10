<script lang="ts">
  import { isJournalEntry, type Entry, type JournalEntry } from '$lib/models/entry';
  import { triggerModal } from '$lib/utils/helper';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import EntryItem from './EntryItem.svelte';
  import EntryModal from './EntryModal.svelte';
  import EntryPlaceholder from './EntryPlaceholder.svelte';

  export let journalEntries: Array<JournalEntry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();

  function handleCopyEntry({ detail: entry }: CustomEvent<JournalEntry>): void {
    triggerModal(EntryModal, { props: { entry }, response: handleEntryAdd });
  }

  function handleEditEntry({ detail: entry }: CustomEvent<JournalEntry>): void {
    triggerModal(EntryModal, { props: { entry, edit: true }, response: handleEntryChange });
  }

  function handleEntryAdd(entry: JournalEntry): void {
    if (entry) {
      dispatch('add', entry);
    }
  }

  function handleEntryChange(value: Entry | string): void {
    if (typeof value === 'object' && isJournalEntry(value)) {
      dispatch('change', value);
    }

    if (typeof value === 'string') {
      dispatch('delete', value);
    }
  }
</script>

<dl class="list-dl">
  {#if isLoading}
    <EntryPlaceholder />
    <EntryPlaceholder />
    <EntryPlaceholder />
  {:else}
    {#each journalEntries as entry (entry.id)}
      <EntryItem {entry} on:copy={handleCopyEntry} on:edit={handleEditEntry} />
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
