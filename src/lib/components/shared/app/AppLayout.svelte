<script lang="ts">
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import AppBar from '$lib/components/shared/app/AppBar.svelte';
  import AppMenu from '$lib/components/shared/app/AppMenu.svelte';
  import AppRail from '$lib/components/shared/app/AppRail.svelte';
  import EnableColorSchemes from '$lib/components/shared/app/EnableColorSchemes.svelte';
  import { scheduleSync } from '$lib/services/sync/sync';
  import { rememberScrollPosition, scrollToLastKnownPosition } from '$lib/shared/ui/scroll';
  import '$lib/stores/app.svelte';
  import { appMenu } from '$lib/stores/appMenu.svelte';
  import { syncStore } from '$lib/stores/sync';
  import { Dialog, Portal } from '@skeletonlabs/skeleton-svelte';
  import type { AfterNavigate } from '@sveltejs/kit';
  import { DateTime } from 'luxon';
  import { onMount, type Snippet } from 'svelte';
  import { get } from 'svelte/store';
  import { pwaInfo } from 'virtual:pwa-info';
  import EnableGlobalMessages from './EnableGlobalMessages.svelte';
  import EnableShortcuts from './EnableShortcuts.svelte';
  import EnableUpdateListener from './EnableUpdateListener.svelte';
  import { runViewTransition } from '$lib/shared/viewTransition';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  const drawerAnimation =
    'transition transition-discrete opacity-0 -translate-x-full starting:data-[state=open]:opacity-0 starting:data-[state=open]:-translate-x-full data-[state=open]:opacity-100 data-[state=open]:translate-x-0';

  onMount(() => {
    document.documentElement.setAttribute('data-test', 'ready');

    const lastSync = get(syncStore).connection?.lastSync;
    if (!lastSync || DateTime.now().diff(DateTime.fromISO(lastSync), 'minutes').minutes > 15) {
      scheduleSync();
    }
  });

  onNavigate((navigation) => {
    return new Promise((resolve) => {
      runViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });

  afterNavigate((params: AfterNavigate) => {
    const isNewPage = params.from?.url.pathname !== params.to?.url.pathname;
    const elemPage = document.querySelector('#page');
    if (isNewPage && elemPage !== null) {
      scrollToLastKnownPosition(params.to?.url.pathname);
    }
  });

  function handlePageScroll(event: Event): void {
    rememberScrollPosition($page.url.pathname, (event.currentTarget as HTMLElement)?.scrollTop);
  }
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<EnableColorSchemes />
<EnableGlobalMessages />
<EnableShortcuts />
<EnableUpdateListener />

<Dialog open={appMenu.open} onOpenChange={(details) => (appMenu.open = details.open)}>
  <Portal>
    <Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
    <Dialog.Positioner class="fixed inset-0 z-50 flex justify-start">
      <Dialog.Content class="h-full w-72 max-w-[80vw] shadow-xl {drawerAnimation}">
        <AppMenu />
      </Dialog.Content>
    </Dialog.Positioner>
  </Portal>
</Dialog>

<div class="h-full grid grid-rows-[auto_1fr] overflow-hidden">
  <AppBar />
  <div class="grid md:grid-cols-[auto_1fr] overflow-hidden">
    <aside class="hidden md:block h-full">
      <AppRail />
    </aside>
    <main
      id="page"
      class="overflow-y-auto outline-offset-[-3px] [scrollbar-gutter:stable]"
      onscroll={handlePageScroll}
    >
      <div class="flex justify-center p-4">
        <div class="flex flex-col items-center gap-4 w-full max-w-(--breakpoint-lg)">
          {@render children?.()}
        </div>
      </div>
    </main>
  </div>
</div>
