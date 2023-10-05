<script lang="ts">
  import {
    isActiveJournalEntry,
    type ActiveJournalEntry,
    type JournalEntry,
  } from '$lib/models/journal';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import JournalEntryItem from './JournalEntryItem.svelte';
  import JournalEntryModal from './JournalEntryModal.svelte';
  import JournalEntryPlaceholder from './JournalEntryPlaceholder.svelte';
  import { infiniteScrollAction } from 'svelte-legos';
  import { JOURNAL_BATCH_SIZE } from '$lib/config/journal';

  export let activeEntries: Array<ActiveJournalEntry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();
  const modalHelper = new ModalHelper(getModalStore());

  let batchCount = 1;

  $: handleActiveEntriesChange(activeEntries);
  $: displayedActiveEntries = activeEntries.slice(0, JOURNAL_BATCH_SIZE * batchCount);

  function handleActiveEntriesChange(activeEntries: Array<ActiveJournalEntry>): void {
    batchCount = 1;
  }

  function handleScrollToBottom(): void {
    if (displayedActiveEntries.length < activeEntries.length) {
      batchCount += 1;
    }
  }

  function handleCopyEntry({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    modalHelper.triggerModal(JournalEntryModal, { props: { entry }, response: handleEntryAdd });
  }

  function handleUpdateEntry({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    modalHelper.triggerModal(JournalEntryModal, {
      props: { entry, edit: true },
      response: handleEntryChange,
    });
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

<dl class="list-dl" use:infiniteScrollAction={{ distance: 500, cb: handleScrollToBottom }}>
  {#if isLoading && (!displayedActiveEntries || displayedActiveEntries.length === 0)}
    <JournalEntryPlaceholder />
    <JournalEntryPlaceholder />
    <JournalEntryPlaceholder />
  {:else}
    {#each displayedActiveEntries as entry (entry.id)}
      <JournalEntryItem {entry} on:copy={handleCopyEntry} on:update={handleUpdateEntry} />
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
