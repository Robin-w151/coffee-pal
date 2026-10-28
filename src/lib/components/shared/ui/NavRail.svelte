<script lang="ts">
  // Maps to Skeleton v4/v5 `Navigation` with `layout="rail"`.
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

<Navigation layout="rail">
  <!-- Top-aligned like v2's rail; v4 centres the menu vertically. -->
  <Navigation.Menu class="justify-start">
    {#each items as route (route.href)}
      <Navigation.TriggerAnchor
        class={isSelected(route) ? 'preset-filled-primary-500' : ''}
        href={route.href}
        title={route.label}
        aria-current={isSelected(route) ? 'page' : undefined}
      >
        <Icon data={route.icon} scale={1.5} />
        <Navigation.TriggerText class="wrap-break-word">{route.label}</Navigation.TriggerText>
      </Navigation.TriggerAnchor>
    {/each}
  </Navigation.Menu>
</Navigation>
