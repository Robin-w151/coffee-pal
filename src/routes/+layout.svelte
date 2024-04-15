<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import AppBar from '$lib/components/ui/app/AppBar.svelte';
  import AppMenu from '$lib/components/ui/app/AppMenu.svelte';
  import AppRail from '$lib/components/ui/app/AppRail.svelte';
  import EnableColorSchemes from '$lib/components/ui/app/EnableColorSchemes.svelte';
  import '$lib/stores/app';
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
  import { onMount } from 'svelte';
  import { pwaInfo } from 'virtual:pwa-info';
  import '../app.scss';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  const drawerStore = getDrawerStore();
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

  onMount(() => {
    document.documentElement.setAttribute('data-test', 'ready');
  });

  afterNavigate((params: AfterNavigate) => {
    const isNewPage = params.from?.url.pathname !== params.to?.url.pathname;
    const elemPage = document.querySelector('#page');
    if (isNewPage && elemPage !== null) {
      elemPage.scrollTop = 0;
    }
  });
</script>

<svelte:head>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html webManifestLink}
</svelte:head>

<EnableColorSchemes />

<Modal />
<Toast />
<Drawer>
  {#if $drawerStore.id === 'app-menu'}
    <AppMenu />
  {/if}
</Drawer>

<AppShell scrollbarGutter="stable">
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
