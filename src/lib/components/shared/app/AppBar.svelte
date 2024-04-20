<script lang="ts">
  import { mainRoute } from '$lib/config/routes';
  import { faBars, faMugHot } from '@fortawesome/free-solid-svg-icons';
  import { AppBar, getDrawerStore, type DrawerSettings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  const drawerStore = getDrawerStore();

  function handleMenuClick(): void {
    const drawerSettings: DrawerSettings = {
      id: 'app-menu',
    };

    drawerStore.open(drawerSettings);
  }
</script>

<AppBar padding="px-2 py-1 md:py-2" shadow="shadow-xl">
  <svelte:fragment slot="lead">
    <button
      class="btn btn-icon hover:variant-soft-secondary md:hidden"
      title="App menu"
      on:click={handleMenuClick}
    >
      <Icon data={faBars} scale={1.5} />
      <span class="sr-only">App menu</span>
    </button>
  </svelte:fragment>
  <a class="flex items-center gap-4 px-2 py-1 md:py-2 w-fit rounded-md" href={mainRoute.href}>
    <span class="hidden md:block">
      <Icon data={faMugHot} scale={1.5} />
    </span>
    <span class="text-2xl">Coffee Pal</span>
  </a>
</AppBar>
