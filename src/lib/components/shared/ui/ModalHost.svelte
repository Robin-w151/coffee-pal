<script lang="ts">
  // Phase 2: a fixed dialog with a backdrop until story 16.
  import { modal } from '$lib/services/ui/modal.svelte';

  const request = $derived(modal.current);

  // Backdrop and Escape respond with undefined, Cancel with false.
  function handleKeydown(event: KeyboardEvent): void {
    if (request && event.key === 'Escape') {
      modal.close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- MIGRATION_PLACEHOLDER: ModalHost -->
{#if request}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <button
      type="button"
      class="absolute inset-0 bg-surface-950/50"
      aria-label="Close"
      onclick={() => modal.close()}
    ></button>
    {#key request.id}
      {#if request.kind === 'confirm'}
        {@const { title, body, confirmLabel, cancelLabel, dangerous } = request.options}
        <div
          class="card relative flex flex-col gap-4 w-full max-w-lg p-4 bg-surface-100-900"
          role="dialog"
          aria-modal="true"
        >
          <header class="text-2xl font-bold">{title}</header>
          <article>{body}</article>
          <footer class="flex justify-end gap-2">
            <button
              type="button"
              class="btn preset-tonal-surface"
              onclick={() => modal.close(false)}
            >
              {cancelLabel ?? 'Cancel'}
            </button>
            <button
              type="button"
              class="btn {dangerous ? 'preset-filled-error-500' : 'preset-filled-primary-500'}"
              onclick={() => modal.close(true)}
            >
              {confirmLabel ?? 'Confirm'}
            </button>
          </footer>
        </div>
      {:else}
        {@const Component = request.component}
        <div class="relative w-full flex justify-center" role="dialog" aria-modal="true">
          <Component {...request.props} close={(result?: unknown) => modal.close(result)} />
        </div>
      {/if}
    {/key}
  </div>
{/if}
