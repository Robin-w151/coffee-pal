<script lang="ts">
  import ResponsiveButton from '$lib/components/shared/elements/form/ResponsiveButton.svelte';
  import { faClone, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
  import type { Snippet } from 'svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    edit?: boolean;
    formValid?: boolean;
    hasChanged?: boolean | undefined;
    allowCopy?: boolean;
    beforeContent?: Snippet;
    afterContent?: Snippet;
    onRemove?: () => void;
    onCopy?: () => void;
    onSave?: () => void;
  }

  let {
    edit = false,
    formValid = false,
    hasChanged = undefined,
    allowCopy = false,
    beforeContent,
    afterContent,
    onRemove,
    onCopy,
    onSave,
  }: Props = $props();

  function handleRemoveClick(): void {
    onRemove?.();
  }

  function handleCopyClick(): void {
    onCopy?.();
  }

  function handleSaveClick(): void {
    onSave?.();
  }
</script>

<div class="flex gap-2">
  {@render beforeContent?.()}
  {#if edit && allowCopy}
    <ResponsiveButton
      type="button"
      label="Copy"
      variant="preset-outlined-tertiary-500"
      disabled={!formValid}
      onclick={handleCopyClick}
    >
      {#snippet iconContent()}
        <Icon data={faClone} />
      {/snippet}
    </ResponsiveButton>
  {/if}
  {#if edit}
    <ResponsiveButton
      type="button"
      label="Delete"
      variant="preset-outlined-error-500"
      onclick={handleRemoveClick}
    >
      {#snippet iconContent()}
        <Icon data={faTrash} />
      {/snippet}
    </ResponsiveButton>
  {/if}
  <ResponsiveButton
    label="Save"
    variant="preset-filled-primary-500"
    disabled={!formValid || (hasChanged !== undefined && !hasChanged)}
    onclick={handleSaveClick}
  >
    {#snippet iconContent()}
      <Icon data={faSave} />
    {/snippet}
  </ResponsiveButton>
  {@render afterContent?.()}
</div>
