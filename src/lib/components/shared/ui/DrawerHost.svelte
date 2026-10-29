<script lang="ts">
  // Shows the drawer service's drawer as a Skeleton v4 `Dialog` on the left side.
  import { drawer, type DrawerId } from '$lib/services/ui/drawer.svelte';
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';
  import { prefersReducedMotion } from 'svelte/motion';
  import { fade, fly } from 'svelte/transition';

  interface Props {
    content: Snippet<[DrawerId]>;
  }

  let { content }: Props = $props();

  // The drawer slides in from the left and the backdrop fades, as in v2 (200ms, off for reduced
  // motion). The last opened drawer stays rendered while it slides out.
  const duration = $derived(prefersReducedMotion.current ? 0 : 200);
  let shownId = $state<DrawerId>();

  $effect(() => {
    if (drawer.current) {
      shownId = drawer.current;
    }
  });

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
    <!-- v4 hides closed parts at once, so `hidden` is kept off while they animate out. -->
    <Dialog.Backdrop
      class="pointer-events-auto fixed inset-0 z-50 bg-surface-950/50"
      onclick={drawer.close}
    >
      {#snippet element(attributes)}
        {#if drawer.current}
          <div {...attributes} hidden={false} transition:fade={{ duration }}></div>
        {/if}
      {/snippet}
    </Dialog.Backdrop>
    <Dialog.Positioner class="fixed inset-y-0 left-0 z-50 flex">
      <!-- Mounted only while open: a mounted, closed Dialog.Content breaks Escape and outside
           clicks for other overlays. -->
      {#if drawer.current}
        <Dialog.Content
          class="h-full w-80 max-w-[100vw] overflow-y-auto bg-surface-100-900 shadow-xl"
        >
          {#snippet element(attributes)}
            <div {...attributes} hidden={false} transition:fly|global={{ x: -320, duration }}>
              {@render content(drawer.current ?? shownId!)}
            </div>
          {/snippet}
        </Dialog.Content>
      {/if}
    </Dialog.Positioner>
  </Portal>
</Dialog>
