<script lang="ts">
  import type { Entry } from '$lib/models/entry';
  import { modalStore } from '@skeletonlabs/skeleton';
  import EntryDetail from './EntryDetail.svelte';

  export let entry: Entry | undefined = undefined;
  export let edit = false;

  function handleChange({ detail: entry }: CustomEvent<Entry>): void {
    $modalStore[0].response?.(entry);
    modalStore.close();
  }

  function handleDelete({ detail: id }: CustomEvent<string>): void {
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
  on:delete={handleDelete}
  on:cancel={handleCancel}
/>
