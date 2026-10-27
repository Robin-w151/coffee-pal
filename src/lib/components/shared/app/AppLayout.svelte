<script lang="ts">
  import { afterNavigate, onNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import AppBar from '$lib/components/shared/app/AppBar.svelte';
  import AppMenu from '$lib/components/shared/app/AppMenu.svelte';
  import AppRail from '$lib/components/shared/app/AppRail.svelte';
  import EnableColorSchemes from '$lib/components/shared/app/EnableColorSchemes.svelte';
  import DrawerHost from '$lib/components/shared/ui/DrawerHost.svelte';
  import ModalHost from '$lib/components/shared/ui/ModalHost.svelte';
  import ToastHost from '$lib/components/shared/ui/ToastHost.svelte';
  import { initScheduledSync, scheduleSync } from '$lib/services/sync/sync';
  import { rememberScrollPosition, scrollToLastKnownPosition } from '$lib/shared/ui/scroll';
  import '$lib/stores/app.svelte';
  import { setSettingsStore } from '$lib/stores/settings.svelte';
  import { setSyncStore } from '$lib/stores/sync.svelte';
  import { setSyncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import type { AfterNavigate } from '@sveltejs/kit';
  import { DateTime } from 'luxon';
  import { onMount, type Snippet } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import '../../../../app.css';
  import EnableShortcuts from './EnableShortcuts.svelte';
  import EnableUpdateListener from './EnableUpdateListener.svelte';
  import { runViewTransition } from '$lib/shared/viewTransition';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  setSettingsStore();
  const syncStore = setSyncStore();
  setSyncAvailabilityStore(syncStore);
  initScheduledSync(syncStore);

  const webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  onMount(() => {
    document.documentElement.setAttribute('data-test', 'ready');

    const lastSync = syncStore.connection?.lastSync;
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

  function handlePageScroll(event: Event & { currentTarget: HTMLElement }): void {
    rememberScrollPosition($page.url.pathname, event.currentTarget.scrollTop);
  }
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<EnableColorSchemes />
<EnableShortcuts />
<EnableUpdateListener />

<ModalHost />
<ToastHost />
<DrawerHost>
  {#snippet content(id)}
    {#if id === 'app-menu'}
      <AppMenu />
    {/if}
  {/snippet}
</DrawerHost>

<!-- Same geometry and region classes as the Skeleton v2 app shell; #page is the only scroll container. -->
<div
  class="grid h-full w-full grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)] overflow-hidden"
>
  <header class="z-10 col-span-full">
    <AppBar />
  </header>
  <aside class="overflow-y-auto overflow-x-hidden">
    <nav class="hidden md:block h-full" aria-label="Main navigation">
      <AppRail />
    </nav>
  </aside>
  <main
    id="page"
    class="overflow-y-auto overflow-x-hidden outline-offset-[-3px]"
    style:scrollbar-gutter="stable"
    onscroll={handlePageScroll}
  >
    <div class="flex justify-center p-4">
      <div class="flex flex-col items-center gap-4 w-full max-w-(--breakpoint-lg)">
        {@render children?.()}
      </div>
    </div>
  </main>
</div>
