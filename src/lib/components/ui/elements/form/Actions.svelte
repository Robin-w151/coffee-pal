<script lang="ts">
  import ResponsiveButton from '$lib/components/ui/elements/form/ResponsiveButton.svelte';
  import { faRotateRight, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let edit = false;
  export let formValid = false;
  export let allowCopy = false;

  const dispatch = createEventDispatcher();

  function handleRemoveClick(): void {
    dispatch('remove');
  }

  function handleCopyClick(): void {
    dispatch('copy');
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
      variant="variant-ghost-error"
      on:click={handleRemoveClick}
    >
      <svelte:fragment slot="icon">
        <Icon data={faTrash} />
      </svelte:fragment>
    </ResponsiveButton>
  {/if}
  {#if allowCopy}
    <ResponsiveButton
      type="button"
      label="Copy"
      variant="variant-ghost-secondary"
      disabled={!formValid}
      on:click={handleCopyClick}
    >
      <svelte:fragment slot="icon">
        <Icon data={faRotateRight} />
      </svelte:fragment>
    </ResponsiveButton>
  {/if}
  <ResponsiveButton
    label="Save"
    variant="variant-filled-primary"
    disabled={!formValid}
    on:click={handleSaveClick}
  >
    <svelte:fragment slot="icon">
      <Icon data={faSave} />
    </svelte:fragment>
  </ResponsiveButton>
</div>
