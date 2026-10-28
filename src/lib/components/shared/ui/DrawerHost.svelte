<script lang="ts">
  // Shows the drawer service's drawer as a Skeleton v4 `Dialog` on the left side.
  import { drawer, type DrawerId } from '$lib/services/ui/drawer.svelte';
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    content: Snippet<[DrawerId]>;
  }

  let { content }: Props = $props();

  // Closing is handled here, not by the Dialog: it reacts to Escape and outside clicks only once
  // it has set itself up after opening, so early input would be lost. The Dialog disables pointer
  // events on <body> while open, so the backdrop takes them back.
  function handleKeydown(event: KeyboardEvent): void {
    if (drawer.current && event.key === 'Escape') {
      drawer.close();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<Dialog open={!!drawer.current} closeOnEscape={false} closeOnInteractOutside={false}>
  <Portal>
    <Dialog.Backdrop
      class="pointer-events-auto fixed inset-0 z-50 bg-surface-950/50"
      onclick={drawer.close}
    />
    <Dialog.Positioner class="fixed inset-y-0 left-0 z-50 flex">
      <!-- Mounted only while open: a mounted, closed Dialog.Content breaks Escape and outside
           clicks for other overlays. -->
      {#if drawer.current}
        <Dialog.Content
          class="h-full w-80 max-w-[100vw] overflow-y-auto bg-surface-100-900 shadow-xl"
        >
          {@render content(drawer.current)}
        </Dialog.Content>
      {/if}
    </Dialog.Positioner>
  </Portal>
</Dialog>
