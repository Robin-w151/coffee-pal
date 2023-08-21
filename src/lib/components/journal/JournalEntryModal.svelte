<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { modalStore } from '@skeletonlabs/skeleton';
  import JournalEntryDetail from './JournalEntryDetail.svelte';

  export let entry: ActiveJournalEntry | undefined = undefined;
  export let edit = false;

  function handleChange({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
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

<JournalEntryDetail
  {entry}
  {edit}
  on:save={handleChange}
  on:remove={handleRemove}
  on:cancel={handleCancel}
/>
