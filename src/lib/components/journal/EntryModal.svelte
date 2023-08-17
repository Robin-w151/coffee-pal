<script lang="ts">
  import { modalStore } from '@skeletonlabs/skeleton';
  import EntryDetail from './EntryDetail.svelte';
  import type { JournalEntry } from '$lib/models/journal';

  export let entry: JournalEntry | undefined = undefined;
  export let edit = false;

  function handleChange({ detail: entry }: CustomEvent<JournalEntry>): void {
    $modalStore[0].response?.(entry);
    modalStore.close();
  }

  function handleRemove({ detail: id }: CustomEvent<string>): void {
    $modalStore[0].response?.(id);
    modalStore.close();
  }

  function handleCancel(): void {
    $modalStore[0].response?.(undefined);
    modalStore.close();
  }
</script>

<EntryDetail
  {entry}
  {edit}
  on:save={handleChange}
  on:remove={handleRemove}
  on:cancel={handleCancel}
/>
