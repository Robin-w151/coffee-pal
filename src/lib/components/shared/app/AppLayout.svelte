<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import AppBar from '$lib/components/shared/app/AppBar.svelte';
  import AppMenu from '$lib/components/shared/app/AppMenu.svelte';
  import AppRail from '$lib/components/shared/app/AppRail.svelte';
  import EnableColorSchemes from '$lib/components/shared/app/EnableColorSchemes.svelte';
  import { scheduleSync } from '$lib/services/sync/sync';
  import { rememberScrollPosition, scrollToLastKnownPosition } from '$lib/shared/ui/scroll';
  import '$lib/stores/app';
  import {
    arrow,
    autoUpdate,
    computePosition,
    flip,
    offset,
    shift,
    size,
    inline,
  } from '@floating-ui/dom';
  import {
    AppShell,
    Drawer,
    Modal,
    Toast,
    getDrawerStore,
    initializeStores,
    storePopup,
  } from '@skeletonlabs/skeleton';
  import type { AfterNavigate } from '@sveltejs/kit';
  import { onMount, type ComponentEvents, type Snippet } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import '../../../../app.scss';
  import EnableUpdateListener from './EnableUpdateListener.svelte';
  import EnableShortcuts from './EnableShortcuts.svelte';
  import { get } from 'svelte/store';
  import { syncStore } from '$lib/stores/sync';
  import { DateTime } from 'luxon';
  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow, size, inline });

  const drawerStore = getDrawerStore();

  let webManifestLink = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

  onMount(() => {
    document.documentElement.setAttribute('data-test', 'ready');

    const lastSync = get(syncStore).connection?.lastSync;
    if (!lastSync || DateTime.now().diff(DateTime.fromISO(lastSync), 'minutes').minutes > 15) {
      scheduleSync();
    }
  });

  afterNavigate((params: AfterNavigate) => {
    const isNewPage = params.from?.url.pathname !== params.to?.url.pathname;
    const elemPage = document.querySelector('#page');
    if (isNewPage && elemPage !== null) {
      scrollToLastKnownPosition(params.to?.url.pathname);
    }
  });

  function handleAppShellScroll(event: ComponentEvents<AppShell>['scroll']): void {
    rememberScrollPosition($page.url.pathname, (event.currentTarget as HTMLElement)?.scrollTop);
  }
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<EnableColorSchemes />
<EnableUpdateListener />
<EnableShortcuts />

<Modal />
<Toast />
<Drawer>
  {#if $drawerStore.id === 'app-menu'}
    <AppMenu />
  {/if}
</Drawer>

<AppShell
  scrollbarGutter="stable"
  regionPage="outline-offset-[-3px]"
  on:scroll={handleAppShellScroll}
>
  {#snippet header()}
    <AppBar />
  {/snippet}
  {#snippet sidebarLeft()}
    <div class="hidden md:block h-full">
      <AppRail />
    </div>
  {/snippet}
  <div class="flex justify-center p-4">
    <div class="flex flex-col items-center gap-4 w-full max-w-screen-lg">
      {@render children?.()}
    </div>
  </div>
</AppShell>
