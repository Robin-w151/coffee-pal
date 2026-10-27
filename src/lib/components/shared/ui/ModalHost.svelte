<script lang="ts">
  // Phase 1: shows the service's current modal with Skeleton v2's modal store.
  import { modal, type ModalRequest } from '$lib/services/ui/modal.svelte';
  import { type ModalSettings } from '@skeletonlabs/skeleton-svelte';
  import { untrack } from 'svelte';
  import { get } from 'svelte/store';

  // Each host sets up the v2 stores for its own subtree.
  initializeStores();
  const modalStore = getModalStore();
  let shownId: string | undefined;

  const dangerous = $derived(
    modal.current?.kind === 'confirm' && modal.current.options.dangerous === true,
  );

  $effect(() => {
    const request = modal.current;
    if (request?.id === shownId) {
      return;
    }

    // The store is read untracked: only service changes drive this effect.
    untrack(() => {
      // The service closed the shown modal (e.g. a custom modal called `close`).
      if (shownId !== undefined && get(modalStore).length > 0) {
        modalStore.close();
      }

      shownId = request?.id;
      if (request) {
        modalStore.trigger(toModalSettings(request));
      }
    });
  });

  function toModalSettings(request: ModalRequest): ModalSettings {
    // Backdrop and Escape respond with undefined, Cancel with false.
    const response = (result: unknown) => {
      if (modal.current?.id === request.id) {
        modal.close(result);
      }
    };

    if (request.kind === 'confirm') {
      const { title, body, confirmLabel, cancelLabel } = request.options;
      return {
        type: 'confirm',
        title,
        body,
        buttonTextConfirm: confirmLabel,
        buttonTextCancel: cancelLabel,
        response,
      };
    }

    return {
      type: 'component',
      component: {
        ref: request.component,
        props: { ...request.props, close: (result?: unknown) => response(result) },
      },
      response,
    };
  }
</script>

<Modal
  regionBackdrop="overflow-hidden"
  buttonNeutral={dangerous
    ? 'preset-tonal-surface border border-surface-500'
    : 'preset-tonal-primary border border-primary-500'}
  buttonPositive={dangerous ? 'preset-filled-error-500' : 'preset-filled-primary-500'}
/>

<style>
  /* v2 renders this layer with h-fit; the extra class outranks it regardless of CSS order. */
  :global(.modal-backdrop .modal-transition) {
    height: 100%;
  }
</style>
