<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import JournalEntryDetail from './JournalEntryDetail.svelte';

  export let entry: ActiveJournalEntry | undefined = undefined;
  export let edit = false;

  const modalStore = getModalStore();

  function handleSave({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    $modalStore[0].response?.({ action: 'update', payload: entry });
    modalStore.close();
  }

  function handleCopy({ detail: entry }: CustomEvent<ActiveJournalEntry>): void {
    $modalStore[0].response?.({ action: 'copy', payload: entry });
    modalStore.close();
  }

  function handleRemove({ detail: id }: CustomEvent<string>): void {
    $modalStore[0].response?.({ action: 'remove', payload: id });
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
  on:save={handleSave}
  on:copy={handleCopy}
  on:remove={handleRemove}
  on:cancel={handleCancel}
/>
