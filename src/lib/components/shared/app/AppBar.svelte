<script lang="ts">
  import { resolve } from '$app/paths';
  import { mainRoute } from '$lib/config/routes';
  import { faBars, faMugHot } from '@fortawesome/free-solid-svg-icons';
  import UiAppBar from '$lib/components/shared/ui/AppBar.svelte';
  import { drawer } from '$lib/services/ui/drawer.svelte';
  import { Icon } from 'svelte-awesome';

  function handleMenuClick(): void {
    drawer.open('app-menu');
  }
</script>

<UiAppBar>
  {#snippet lead()}
    <button
      class="btn btn-icon hover:variant-soft-secondary md:hidden"
      title="App menu"
      onclick={handleMenuClick}
    >
      <Icon data={faBars} scale={1.5} />
      <span class="sr-only">App menu</span>
    </button>
  {/snippet}
  {#snippet title()}
    <a
      class="flex items-center gap-4 px-2 py-1 md:py-2 w-fit rounded-md"
      href={resolve(mainRoute.href, {})}
    >
      <span class="hidden md:block">
        <Icon data={faMugHot} scale={1.5} />
      </span>
      <span class="text-2xl">Coffee Pal</span>
    </a>
  {/snippet}
</UiAppBar>
