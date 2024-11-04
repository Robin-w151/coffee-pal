<script lang="ts">
  import { faPlus, faRotate } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import Spinner from '../Spinner.svelte';
  import { DateTime } from 'luxon';

  interface Props {
    isSyncEnabled?: boolean;
    isSynchronizing?: boolean;
    lastSync?: string;
    onAdd?: () => void;
    onSynchronize?: () => void;
  }

  let {
    isSyncEnabled = false,
    isSynchronizing = false,
    lastSync,
    onAdd,
    onSynchronize,
  }: Props = $props();

  let lastSyncText = $derived.by(() => {
    if (!lastSync) {
      return;
    }

    const parsedLastSync = DateTime.fromISO(lastSync);
    if (!parsedLastSync.isValid) {
      return;
    }

    return `Last sync: ${parsedLastSync.toFormat('dd.MM.yyyy, HH:mm')}`;
  });

  function handleAddClick(): void {
    onAdd?.();
  }

  function handleSyncClick(): void {
    if (isSyncEnabled && !isSynchronizing) {
      onSynchronize?.();
    }
  }
</script>

<div class="page-actions-token">
  {#if isSyncEnabled}
    <button
      class="btn btn-icon btn-icon-lg variant-filled-primary shadow-xl"
      title="Synchronize data{lastSyncText ? `\n${lastSyncText}` : ''}"
      onclick={handleSyncClick}
    >
      {#if isSynchronizing}
        <Spinner color="white" />
      {:else}
        <Icon data={faRotate} scale={1.25} />
        <span class="sr-only"
          >Synchronize data, {#if lastSyncText}
            {lastSyncText}
          {/if}</span
        >
      {/if}
    </button>
  {/if}
  <button
    class="btn btn-icon btn-icon-xl variant-filled-primary shadow-xl"
    title="Add new entry"
    onclick={handleAddClick}
  >
    <Icon data={faPlus} scale={1.5} />
    <span class="sr-only">Add new entry</span>
  </button>
</div>
