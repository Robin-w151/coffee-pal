<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import CoffeeEntryDetail from './CoffeeEntryDetail.svelte';

  export let entry: ActiveCoffeeEntry | undefined = undefined;
  export let edit = false;

  const modalStore = getModalStore();

  function handleChange({ detail: entry }: CustomEvent<ActiveCoffeeEntry>): void {
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

<CoffeeEntryDetail
  {entry}
  {edit}
  on:save={handleChange}
  on:remove={handleRemove}
  on:cancel={handleCancel}
/>
