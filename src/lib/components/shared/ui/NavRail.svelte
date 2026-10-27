<script lang="ts">
  // Maps to Skeleton v4/v5 `Navigation` with `layout="rail"`. Phase 2: plain links until story 16.
  import type { Route } from '$lib/models/route';
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

<!-- MIGRATION_PLACEHOLDER: NavRail -->
<div class="flex flex-col h-full w-20 p-1 space-y-1 bg-surface-50-950">
  {#each items as route (route.href)}
    <a
      class="flex flex-col items-center gap-1 overflow-hidden rounded-md px-1 py-2 text-xs {isSelected(
        route,
      )
        ? 'preset-filled-primary-500'
        : 'hover:preset-tonal-primary'}"
      href={route.href}
      title={route.label}
      aria-current={isSelected(route) ? 'page' : undefined}
    >
      <Icon data={route.icon} scale={1.5} />
      <span class="wrap-break-word">{route.label}</span>
    </a>
  {/each}
</div>
