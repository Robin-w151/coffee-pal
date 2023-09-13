<script lang="ts">
  import { faPlus, faRotate } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import Spinner from './Spinner.svelte';

  export let isSyncEnabled = false;
  export let isSynchronizing = false;

  const dispatch = createEventDispatcher();

  function handleAddClick(): void {
    dispatch('add');
  }

  function handleSyncClick(): void {
    dispatch('synchronize');
  }
</script>

<div class="flex items-end gap-4 fixed z-10 bottom-8 right-8">
  {#if isSyncEnabled}
    <button
      class="btn btn-icon btn-icon-lg variant-filled-primary shadow-xl"
      title="Synchronize data"
      on:click={handleSyncClick}
    >
      {#if isSynchronizing}
        <Spinner color="white" />
      {:else}
        <Icon data={faRotate} scale={1.25} />
        <span class="sr-only">Synchronize data</span>
      {/if}
    </button>
  {/if}
  <button
    class="btn btn-icon btn-icon-xl variant-filled-primary shadow-xl"
    title="Add new entry"
    on:click={handleAddClick}
  >
    <Icon data={faPlus} scale={1.5} />
    <span class="sr-only">Add new entry</span>
  </button>
</div>
