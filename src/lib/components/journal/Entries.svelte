<script lang="ts">
  import type { Entry } from '$lib/models/entry';
  import { triggerModal } from '$lib/utils/helper';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import EntryItem from './EntryItem.svelte';
  import EntryModal from './EntryModal.svelte';
  import EntryPlaceholder from './EntryPlaceholder.svelte';

  export let entries: Array<Entry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();

  function handleEditEntry({ detail: entry }: CustomEvent<Entry>): void {
    triggerModal(EntryModal, { props: { entry, edit: true }, response: handleEntryChange });
  }

  function handleEntryChange(value: Entry | string): void {
    if (typeof value === 'object') {
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
    {#each entries as entry (entry.id)}
      <EntryItem {entry} on:edit={handleEditEntry} />
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
