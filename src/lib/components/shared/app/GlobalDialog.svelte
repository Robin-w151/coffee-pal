<script lang="ts">
  import { modalHelper } from '$lib/shared/ui/modal.svelte';
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';

  const animation =
    'transition transition-discrete opacity-0 translate-y-8 starting:data-[state=open]:opacity-0 starting:data-[state=open]:translate-y-8 data-[state=open]:opacity-100 data-[state=open]:translate-y-0';

  let request = $derived(modalHelper.current);

  function handleOpenChange(details: { open: boolean }): void {
    if (!details.open) {
      modalHelper.close();
    }
  }
</script>

<Dialog open={!!request} onOpenChange={handleOpenChange}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-center items-center p-4">
      <Dialog.Content data-testid="modal" class="w-full max-w-(--breakpoint-sm) {animation}">
        {#if request?.kind === 'confirm'}
          <div class="card flex flex-col gap-4 p-4">
            <Dialog.Title class="text-2xl font-bold">{request.title}</Dialog.Title>
            <Dialog.Description>{request.body}</Dialog.Description>
            <footer class="flex justify-end gap-2">
              <button
                class="btn {request.dangerous
                  ? 'preset-outlined-surface-500'
                  : 'preset-outlined-primary-500'}"
                onclick={() => modalHelper.close(false)}
              >
                Cancel
              </button>
              <button
                class="btn {request.dangerous
                  ? 'preset-filled-error-500'
                  : 'preset-filled-primary-500'}"
                onclick={() => modalHelper.close(true)}
              >
                Confirm
              </button>
            </footer>
          </div>
        {:else if request?.kind === 'component'}
          {@const DialogComponent = request.component}
          <DialogComponent
            {...request.props}
            close={(response?: any) => modalHelper.close(response)}
          />
        {/if}
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>
