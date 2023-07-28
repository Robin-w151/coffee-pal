<script lang="ts">
  import CpAppBar from '$lib/components/ui/app/CPAppBar.svelte';
  import CpAppMenu from '$lib/components/ui/app/CPAppMenu.svelte';
  import CpAppRail from '$lib/components/ui/app/CPAppRail.svelte';
  import { arrow, autoUpdate, computePosition, flip, offset, shift } from '@floating-ui/dom';
  import { AppShell, Drawer, Modal, drawerStore, storePopup } from '@skeletonlabs/skeleton';
  import { pwaInfo } from 'virtual:pwa-info';
  import '../app.scss';

  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  $: webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';
</script>

<svelte:head>
  {@html webManifestLink}
</svelte:head>

<Modal />

<Drawer>
  {#if $drawerStore.id === 'app-menu'}
    <CpAppMenu />
  {/if}
</Drawer>

<AppShell>
  <svelte:fragment slot="header">
    <CpAppBar />
  </svelte:fragment>
  <div class="hidden md:block h-full" slot="sidebarLeft">
    <CpAppRail />
  </div>
  <div class="flex justify-center p-4">
    <div class="flex flex-col items-center gap-4 w-full max-w-screen-md">
      <slot />
    </div>
  </div>
</AppShell>
