<script lang="ts">
  // Maps to Skeleton v4/v5 `Navigation` with `layout="rail"`. Phase 1: wraps v2 `AppRail`.
  import type { Route } from '$lib/models/route';
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    items: ReadonlyArray<Route>;
    pathname: string;
  }

  let { items, pathname }: Props = $props();

  function isSelected(route: Route): boolean {
    return route.match?.test(pathname) ?? route.href === pathname;
  }
</script>

<Navigation
  background="bg-surface-50-950"
  regionDefault="p-1 space-y-1"
  hover="preset-tonal-primary"
  active="preset-filled-primary-500"
>
  {#each items as route (route.href)}
    <AppRailAnchor
      class="block overflow-hidden rounded-md"
      href={route.href}
      title={route.label}
      selected={isSelected(route)}
      aria-current={isSelected(route) ? 'page' : undefined}
      regionLabel="px-1"
    >
      {#snippet lead()}
        <Icon data={route.icon} scale={1.5} />
      {/snippet}
      <span class="wrap-break-word">{route.label}</span>
    </AppRailAnchor>
  {/each}
</Navigation>
