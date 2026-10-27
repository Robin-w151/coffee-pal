<script lang="ts">
  // Phase 1: shows the service's drawer with Skeleton v2's drawer store.
  import { drawer, type DrawerId } from '$lib/services/ui/drawer.svelte';
  import { untrack, type Snippet } from 'svelte';
  import { get } from 'svelte/store';

  interface Props {
    content: Snippet<[DrawerId]>;
  }

  let { content }: Props = $props();

  // Each host sets up the v2 stores for its own subtree.
  initializeStores();
  const drawerStore = getDrawerStore();

  // The last opened drawer stays rendered while v2 animates it out, as with v2's own id.
  let shownId = $state<DrawerId | undefined>();

  // Service → v2 store. The store is read untracked, so a close by v2 can't reopen the drawer.
  $effect(() => {
    const id = drawer.current;
    untrack(() => {
      const state = get(drawerStore);
      if (id && !(state.open && state.id === id)) {
        shownId = id;
        drawerStore.open({ id });
      } else if (!id && state.open) {
        drawerStore.close();
      }
    });
  });

  // v2 store → service: backdrop click and Escape close the v2 drawer directly.
  $effect(() =>
    drawerStore.subscribe(({ open }) => {
      if (!open && untrack(() => drawer.current)) {
        drawer.close();
      }
    }),
  );
</script>

<Drawer>
  {#if shownId}
    {@render content(shownId)}
  {/if}
</Drawer>
