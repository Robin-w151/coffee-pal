<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/stores';
  import { routes } from '$lib/config/routes';
  import type { Route } from '$lib/models/route';
  import { drawer } from '$lib/services/ui/drawer.svelte';
  import { faClose } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  const routeActiveClass = $derived((route: Route) =>
    isSelected(route, $page.url.pathname)
      ? 'preset-filled-primary-500'
      : 'hover:preset-tonal-primary',
  );

  function handleClick(): void {
    drawer.close();
  }

  function isSelected(route: Route, pathname: string): boolean {
    if (route.match) {
      return route.match.test(pathname);
    } else {
      return route.href === pathname;
    }
  }
</script>

<section class="flex flex-col gap-4 p-4">
  <div class="flex justify-between items-center">
    <h2 class="h2">Coffee Pal</h2>
    <button class="btn btn-icon hover:preset-tonal-secondary" onclick={handleClick}>
      <Icon data={faClose} />
    </button>
  </div>
  <hr />
  <nav>
    <ul class="flex flex-col gap-1">
      {#each routes as route (route.href)}
        <li>
          <a
            class="grid grid-cols-[1.25rem_1fr] items-center gap-4 px-4 py-2 rounded-base {routeActiveClass(
              route,
            )}"
            href={resolve(route.href, {})}
            aria-current={isSelected(route, $page.url.pathname) ? 'page' : undefined}
            onclick={handleClick}
          >
            <span class="flex items-center justify-self-center">
              <Icon data={route.icon} />
            </span>
            <span>{route.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</section>
