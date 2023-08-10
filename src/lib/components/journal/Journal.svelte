<script lang="ts">
  import type { JournalEntry } from '$lib/models/entry';
  import { journalStore } from '$lib/stores/journal';
  import { syncStore } from '$lib/stores/sync';
  import { triggerModal } from '$lib/utils/helper';
  import { sync } from '$lib/utils/sync';
  import { faPlus, faRotate } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import Spinner from '../ui/elements/Spinner.svelte';
  import Entries from './Entries.svelte';
  import EntryModal from './EntryModal.svelte';

  function handleAddClick(): void {
    triggerModal(EntryModal, { response: handleEntryAdd });
  }

  function handleSyncClick(): void {
    sync();
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

<div class="flex items-end gap-4 fixed z-10 bottom-8 right-8">
  <button
    class="btn btn-icon btn-icon-lg variant-filled-primary shadow-xl"
    on:click={handleSyncClick}
  >
    {#if $syncStore.isSynchronizing}
      <Spinner color="white" />
    {:else}
      <Icon data={faRotate} scale={1.25} />
      <span class="sr-only">Synchronize</span>
    {/if}
  </button>
  <button
    class="btn btn-icon btn-icon-xl variant-filled-primary shadow-xl"
    on:click={handleAddClick}
  >
    <Icon data={faPlus} scale={1.5} />
    <span class="sr-only">Add</span>
  </button>
</div>

<div class="flex flex-col gap-4">
  <Entries {...$journalStore} on:change={handleEntryChange} on:delete={handleEntryDelete} />
</div>
