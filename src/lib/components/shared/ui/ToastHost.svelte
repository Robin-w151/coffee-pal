<script lang="ts">
  // Renders the toast service's toasts with Skeleton v4's toaster.
  import { toast } from '$lib/services/ui/toast.svelte';
  import { Toast, createToaster } from '@skeletonlabs/skeleton-svelte';

  const toaster = createToaster({ placement: 'bottom', overlap: false });

  // Plain Set on purpose: bookkeeping for the effect, which must not depend on it.
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const shown = new Set<string>();

  $effect(() => {
    const open = toast.toasts;

    for (const { id, kind, message, action } of open) {
      if (shown.has(id)) {
        continue;
      }

      shown.add(id);
      toaster.create({
        id,
        description: message,
        type: kind,
        // The service owns the timeout, so all toasts close the same way.
        duration: Infinity,
        action: action && { label: action.label, onClick: () => void toast.runAction(id) },
        // Closed in the toaster (close button, action): the service closes it too.
        onStatusChange: ({ status }) => {
          if (status === 'dismissing') {
            toast.dismiss(id);
          }
        },
      });
    }

    for (const id of shown) {
      if (!open.some((message) => message.id === id)) {
        shown.delete(id);
        toaster.dismiss(id);
      }
    }
  });
</script>

<Toast.Group {toaster}>
  {#snippet children(options)}
    <!-- role="alert" as with v2; v4 announces toasts as role="status". -->
    <Toast toast={options} role="alert" class="flex-col sm:flex-row">
      <Toast.Message>
        <Toast.Description>{options.description}</Toast.Description>
      </Toast.Message>
      {#if options.action}
        <Toast.ActionTrigger>{options.action.label}</Toast.ActionTrigger>
      {/if}
      <Toast.CloseTrigger aria-label="Dismiss toast" />
    </Toast>
  {/snippet}
</Toast.Group>
