<script lang="ts">
  import type { Entry } from '$lib/models/entry';
  import { triggerModal } from '$lib/utils/helper';
  import { faFaceSadCry, faPencil } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
  import EntryModal from './EntryModal.svelte';
  import { createEventDispatcher } from 'svelte';
  import { calculateRatio } from '$lib/utils/math';
  import EntryPlaceholder from './EntryPlaceholder.svelte';

  export let entries: Array<Entry>;
  export let isLoading = false;

  const dispatch = createEventDispatcher();

  function handleEditEntry(entry: Entry): void {
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
      <div class="justify-between">
        <span class="badge variant-soft-secondary w-16"
          >{calculateRatio(entry.coffee, entry.water) ?? 'unknown'}</span
        >
        <span class="block min-w-0 flex-1">
          <dt class="overflow-hidden text-ellipsis">
            <span class="font-bold">{entry.title}</span>
          </dt>
          <dd class="overflow-hidden text-ellipsis">
            <span>{entry.description ? entry.description : 'No description'}</span>
          </dd>
        </span>
        <span class="flex gap-3">
          <button
            class="btn btn-icon hover:variant-soft-primary"
            on:click={() => handleEditEntry(entry)}
          >
            <Icon data={faPencil} />
          </button>
        </span>
      </div>
    {:else}
      <p class="flex justify-center items-center gap-2">
        <span class="flex items-center">
          <Icon data={faFaceSadCry} />
        </span>
        <span>No entries yet. Start cooking coffee and create your first.</span>
      </p>
    {/each}
  {/if}
</dl>
