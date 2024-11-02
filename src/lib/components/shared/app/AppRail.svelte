<script lang="ts">
  import { page } from '$app/stores';
  import { routes } from '$lib/config/routes';
  import type { Route } from '$lib/models/route';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  function isSelected(route: Route, pathname: string): boolean {
    if (route.match) {
      return route.match.test(pathname);
    } else {
      return route.href === pathname;
    }
  }
</script>

<AppRail
  background="bg-surface-50-900-token"
  regionDefault="p-1 space-y-1"
  hover="bg-primary-hover-token"
  active="bg-primary-active-token"
>
  {#each routes as route (route.href)}
    <AppRailAnchor
      href={route.href}
      title={route.label}
      selected={isSelected(route, $page?.url?.pathname)}
      regionLabel="px-1"
    >
      {#snippet lead()}
        <Icon data={route.icon} scale={1.5} />
      {/snippet}
      <span class="break-words">{route.label}</span>
    </AppRailAnchor>
  {/each}
</AppRail>
