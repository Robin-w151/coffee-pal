<script lang="ts">
  import type { Entry, JournalEntry } from '$lib/models/entry';
  import { triggerModal } from '$lib/utils/helper';
  import { faPlus } from '@fortawesome/free-solid-svg-icons';
  import Entries from './Entries.svelte';
  import EntryModal from './EntryModal.svelte';
  import { Icon } from 'svelte-awesome';
  import { journalStore } from '$lib/stores/journal';

  function handleAddClick(): void {
    triggerModal(EntryModal, { response: handleEntryAdd });
  }

  function handleEntryAdd(entry: JournalEntry): void {
    if (entry) {
      journalStore.add(entry);
    }
  }

  function handleEntryChange({ detail: entry }: CustomEvent<JournalEntry>): void {
    journalStore.edit(entry);
  }

  function handleEntryDelete({ detail: id }: CustomEvent<string>): void {
    journalStore.remove(id);
  }
</script>

<button
  class="btn btn-icon btn-icon-xl variant-filled-primary fixed z-10 bottom-8 right-8 shadow-xl"
  on:click={handleAddClick}
>
  <Icon data={faPlus} scale={1.5} />
  <span class="sr-only">Add</span>
</button>

<div class="flex flex-col gap-4">
  <Entries {...$journalStore} on:change={handleEntryChange} on:delete={handleEntryDelete} />
</div>
