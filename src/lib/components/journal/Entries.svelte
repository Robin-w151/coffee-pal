<script lang="ts">
  import { triggerModal } from '$lib/utils/helper';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import EntryItem from './EntryItem.svelte';
  import EntryModal from './EntryModal.svelte';
  import EntryPlaceholder from './EntryPlaceholder.svelte';
  import {
    isActiveJournalEntry,
    type ActiveJournalEntry,
    type JournalEntry,
  } from '$lib/models/journal';

  export let activeEntries: Array<ActiveJournalEntry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();

  function handleCopyEntry({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    triggerModal(EntryModal, { props: { entry }, response: handleEntryAdd });
  }

  function handleUpdateEntry({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    triggerModal(EntryModal, { props: { entry, edit: true }, response: handleEntryChange });
  }

  function handleEntryAdd(entry: ActiveJournalEntry): void {
    if (entry) {
      dispatch('add', entry);
    }
  }

  function handleEntryChange(value: JournalEntry | string): void {
    if (typeof value === 'object' && isActiveJournalEntry(value)) {
      dispatch('update', value);
    }

    if (typeof value === 'string') {
      dispatch('remove', value);
    }
  }
</script>

<dl class="list-dl">
  {#if isLoading}
    <EntryPlaceholder />
    <EntryPlaceholder />
    <EntryPlaceholder />
  {:else}
    {#each activeEntries as entry (entry.id)}
      <EntryItem {entry} on:copy={handleCopyEntry} on:update={handleUpdateEntry} />
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
