<script lang="ts">
  import type { ActiveJournalEntry, JournalEntryAction } from '$lib/models/journal';
  import { journalStore } from '$lib/stores/journal';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { infiniteScrollAction } from 'svelte-legos';
  import JournalEntryItem from './JournalEntryItem.svelte';
  import JournalEntryModal from './JournalEntryModal.svelte';
  import JournalEntryPlaceholder from './JournalEntryPlaceholder.svelte';

  export let entries: Array<ActiveJournalEntry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();
  const modalHelper = new ModalHelper(getModalStore());

  function handleScrollToBottom(): void {
    journalStore.loadMore();
  }

  function handleShowEntry({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    modalHelper.triggerModal(JournalEntryModal, {
      props: { entry, edit: true },
      response: handleEntryChange,
    });
  }

  function handleEntryChange(value: JournalEntryAction): void {
    if (value) {
      dispatch(value.action, value.payload);
    }
  }
</script>

<dl class="list-dl" use:infiniteScrollAction={{ distance: 500, cb: handleScrollToBottom }}>
  {#if isLoading && (!entries || entries.length === 0)}
    <JournalEntryPlaceholder />
    <JournalEntryPlaceholder />
    <JournalEntryPlaceholder />
  {:else}
    {#each entries as entry (entry.id)}
      <JournalEntryItem {entry} on:update={handleShowEntry} />
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
