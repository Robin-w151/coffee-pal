<script lang="ts">
  // Shows the head of the modal service's queue in a Skeleton v4 `Dialog`.
  import { modal } from '$lib/services/ui/modal.svelte';
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

  const request = $derived(modal.current);

  // Backdrop and Escape respond with undefined, Cancel with false.
  function handleOpenChange(details: { open: boolean }): void {
    if (!details.open && modal.current) {
      modal.close();
    }
  }
</script>

<Dialog open={!!request} onOpenChange={handleOpenChange}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center p-4">
      {#if request?.kind === 'confirm'}
        {@const { title, body, confirmLabel, cancelLabel, dangerous } = request.options}
        <Dialog.Content class="card flex flex-col gap-4 w-full max-w-lg p-4 bg-surface-100-900">
          <Dialog.Title class="text-2xl font-bold">{title}</Dialog.Title>
          <Dialog.Description>{body}</Dialog.Description>
          <footer class="flex justify-end gap-2">
            <button type="button" class="btn preset-tonal" onclick={() => modal.close(false)}>
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
        </Dialog.Content>
      {:else if request}
        {@const Component = request.component}
        <!-- Custom modals bring their own card. -->
        <Dialog.Content class="flex justify-center w-full">
          <Component {...request.props} close={(result?: unknown) => modal.close(result)} />
        </Dialog.Content>
      {/if}
    </Dialog.Positioner>
  </Portal>
</Dialog>
