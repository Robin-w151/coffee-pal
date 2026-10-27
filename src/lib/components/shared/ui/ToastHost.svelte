<script lang="ts">
  // Phase 2: a plain toast list until story 16.
  import { toast, type ToastKind } from '$lib/services/ui/toast.svelte';

  const BACKGROUNDS: Record<ToastKind, string> = {
    info: 'preset-filled-primary-500',
    error: 'preset-filled-error-500',
  };
</script>

<!-- MIGRATION_PLACEHOLDER: ToastHost -->
<div class="fixed bottom-4 inset-x-4 z-50 flex flex-col items-center gap-2 pointer-events-none">
  {#each toast.toasts as { id, kind, message, action } (id)}
    <div
      class="card flex flex-col sm:flex-row items-center gap-4 px-8 py-4 pointer-events-auto {BACKGROUNDS[
        kind
      ]}"
      role="alert"
    >
      <span>{message}</span>
      <div class="flex gap-2">
        {#if action}
          <button type="button" class="btn" onclick={() => toast.runAction(id)}
            >{action.label}</button
          >
        {/if}
        <button type="button" class="btn" aria-label="Dismiss" onclick={() => toast.dismiss(id)}
          >✕</button
        >
      </div>
    </div>
  {/each}
</div>
