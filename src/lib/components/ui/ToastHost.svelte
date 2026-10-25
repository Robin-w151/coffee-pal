<script lang="ts">
  // Phase 1: renders the service's toasts with Skeleton v2's toast store.
  import { toast, type ToastId, type ToastKind } from '$lib/services/ui/toast.svelte';
  import { Toast, getToastStore, initializeStores } from '@skeletonlabs/skeleton';

  const BACKGROUNDS: Record<ToastKind, string> = {
    info: 'variant-filled-primary',
    error: 'variant-filled-error',
  };

  // Each host sets up the v2 stores for its own subtree.
  initializeStores();
  const toastStore = getToastStore();
  // Plain Map on purpose: bookkeeping for the effect, which must not depend on it.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const shown = new Map<ToastId, string>();

  $effect(() => {
    const open = toast.toasts;

    for (const { id, kind, message, action } of open) {
      if (shown.has(id)) {
        continue;
      }

      const storeId = toastStore.trigger({
        message,
        background: BACKGROUNDS[kind],
        classes: 'flex-col sm:flex-row gap-4',
        // The service owns the timeout, so all toasts close the same way.
        autohide: false,
        action: action && { label: action.label, response: () => toast.runAction(id) },
        callback: ({ status }) => {
          if (status === 'closed') {
            toast.dismiss(id);
          }
        },
      });
      shown.set(id, storeId);
    }

    for (const [id, storeId] of shown) {
      if (!open.some((message) => message.id === id)) {
        shown.delete(id);
        toastStore.close(storeId);
      }
    }
  });
</script>

<Toast />

<style>
  /* v2 renders these elements; the extra class outranks its utilities regardless of CSS order. */
  :global(.snackbar-wrapper .snackbar) {
    padding-left: 2rem;
    padding-right: 2rem;
  }

  :global(.toast .toast-actions) {
    margin-left: 0 !important;
  }
</style>
