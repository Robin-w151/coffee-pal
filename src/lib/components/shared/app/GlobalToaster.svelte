<script lang="ts">
  import { toaster } from '$lib/shared/ui/toast';
  import { Toast } from '@skeletonlabs/skeleton-svelte';
</script>

<Toast.Group {toaster}>
  {#snippet children(toast)}
    <Toast
      {toast}
      class={toast.type === 'error' ? 'preset-filled-error-500' : 'preset-filled-primary-500'}
    >
      <Toast.Message>
        <Toast.Description>{toast.description}</Toast.Description>
      </Toast.Message>
      {#if toast.action}
        <Toast.ActionTrigger class="btn preset-outlined">
          {toast.action.label}
        </Toast.ActionTrigger>
      {/if}
      <Toast.CloseTrigger />
    </Toast>
  {/snippet}
</Toast.Group>
