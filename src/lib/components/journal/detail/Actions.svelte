<script lang="ts">
  import ResponsiveButton from '$lib/components/ui/elements/form/ResponsiveButton.svelte';
  import { faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let edit = false;
  export let saveDisabled = false;

  const dispatch = createEventDispatcher();

  function handleRemoveClick(): void {
    dispatch('remove');
  }

  function handleSaveClick(): void {
    dispatch('save');
  }
</script>

<div class="flex gap-2">
  {#if edit}
    <ResponsiveButton
      type="button"
      label="Delete"
      variant="variant-soft-error"
      on:click={handleRemoveClick}
    >
      <svelte:fragment slot="icon">
        <Icon data={faTrash} />
      </svelte:fragment>
    </ResponsiveButton>
  {/if}
  <ResponsiveButton
    label="Save"
    disabled={saveDisabled}
    variant="variant-filled-primary"
    on:click={handleSaveClick}
  >
    <svelte:fragment slot="icon">
      <Icon data={faSave} />
    </svelte:fragment>
  </ResponsiveButton>
</div>
