<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/stores';
  import { routes } from '$lib/config/routes';
  import type { Route } from '$lib/models/route';
  import { faClose } from '@fortawesome/free-solid-svg-icons';
  import { getDrawerStore } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  const drawerStore = getDrawerStore();

  let routeActiveClass = $derived((route: Route) =>
    isSelected(route, $page.url.pathname) ? 'bg-primary-active-token' : '',
  );

  function handleClick(): void {
    drawerStore.close();
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
    <button class="btn btn-icon hover:variant-soft-secondary" onclick={handleClick}>
      <Icon data={faClose} />
    </button>
  </div>
  <hr />
  <nav class="list-nav">
    <ul>
      {#each routes as route (route.href)}
        <li>
          <a
            class="!grid grid-cols-[1.25rem_1fr] {routeActiveClass(route)}"
            href={resolve(route.href, {})}
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
