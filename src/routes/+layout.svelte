<script lang="ts">
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
  import { pwaInfo } from 'virtual:pwa-info';
  import '../app.scss';
  import { onMount } from 'svelte';

  initializeStores();
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  const drawerStore = getDrawerStore();
  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

  onMount(() => {
    document.documentElement.setAttribute('data-test', 'ready');
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

<AppShell slotHeader="fixed w-full z-20">
  <svelte:fragment slot="header">
    <AppBar />
  </svelte:fragment>
  <div class="app-rail" slot="sidebarLeft">
    <AppRail />
  </div>
  <div class="app-content">
    <div class="flex flex-col items-center gap-4 w-full max-w-screen-lg">
      <slot />
    </div>
  </div>
</AppShell>

<style lang="postcss">
  .app-rail {
    display: none;
    position: fixed;
    margin-top: 64px;
    height: calc(100dvh - 64px);

    @media screen and (width >= theme('screens.md')) {
      display: block;
    }
  }

  .app-content {
    display: flex;
    justify-content: center;
    margin-top: 59px;
    padding: 1rem;

    @media screen and (width >= theme('screens.md')) {
      margin-top: 64px;
      margin-left: 80px;
    }
  }
</style>
