<script lang="ts">
  import { resolve } from '$app/paths';
  import { mainRoute } from '$lib/config/routes';
  import { appMenu } from '$lib/stores/appMenu.svelte';
  import { faBars, faMugHot } from '@fortawesome/free-solid-svg-icons';
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';
</script>

<AppBar class="px-4 md:px-2 py-1 md:py-2 shadow-xl">
  <AppBar.Toolbar class="grid-cols-[auto_1fr] max-md:gap-2">
    <AppBar.Lead>
      <button
        class="btn btn-icon hover:preset-tonal-secondary md:hidden"
        title="App menu"
        onclick={() => appMenu.show()}
      >
        <Icon data={faBars} scale={1.5} />
        <span class="sr-only">App menu</span>
      </button>
    </AppBar.Lead>
    <AppBar.Headline>
      <a
        class="flex items-center gap-4 px-2 py-1 md:py-2 w-fit rounded-md"
        href={resolve(mainRoute.href, {})}
      >
        <span class="hidden md:block">
          <Icon data={faMugHot} scale={1.5} />
        </span>
        <span class="text-2xl">Coffee Pal</span>
      </a>
    </AppBar.Headline>
  </AppBar.Toolbar>
</AppBar>
