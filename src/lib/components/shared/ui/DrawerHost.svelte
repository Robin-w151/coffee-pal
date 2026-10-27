<script lang="ts">
  // Phase 2: a fixed panel with a backdrop until story 16.
  import { drawer, type DrawerId } from '$lib/services/ui/drawer.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    content: Snippet<[DrawerId]>;
  }

  let { content }: Props = $props();

  function handleKeydown(event: KeyboardEvent): void {
    if (drawer.current && event.key === 'Escape') {
      drawer.close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- MIGRATION_PLACEHOLDER: DrawerHost -->
{#if drawer.current}
  <div class="fixed inset-0 z-50 flex">
    <button
      type="button"
      class="absolute inset-0 bg-surface-950/50"
      aria-label="Close"
      onclick={drawer.close}
    ></button>
    <div class="relative h-full w-80 max-w-full overflow-y-auto bg-surface-100-900" role="dialog">
      {@render content(drawer.current)}
    </div>
  </div>
{/if}
