<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/stores';
  import AppBar from '$lib/components/shared/app/AppBar.svelte';
  import AppMenu from '$lib/components/shared/app/AppMenu.svelte';
  import AppRail from '$lib/components/shared/app/AppRail.svelte';
  import EnableColorSchemes from '$lib/components/shared/app/EnableColorSchemes.svelte';
  import { sync } from '$lib/services/sync/sync';
  import '$lib/stores/app';
  import { rememberScrollPosition, scrollToLastKnownPosition } from '$lib/shared/ui/scroll';
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
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
  import { onMount, type ComponentEvents } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import '../../../../app.scss';
  import EnableUpdateListener from './EnableUpdateListener.svelte';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  const drawerStore = getDrawerStore();

  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

  onMount(() => {
    document.documentElement.setAttribute('data-test', 'ready');
    setTimeout(() => sync(), 5000);
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
  <svelte:fragment slot="header">
    <AppBar />
  </svelte:fragment>
  <div class="hidden md:block h-full" slot="sidebarLeft">
    <AppRail />
  </div>
  <div class="flex justify-center p-4">
    <div class="flex flex-col items-center gap-4 w-full max-w-screen-lg">
      <slot />
    </div>
  </div>
</AppShell>
