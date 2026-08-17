<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/stores';
  import { routes } from '$lib/config/routes';
  import { isRouteSelected } from '$lib/shared/ui/route';
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';
</script>

<Navigation layout="rail" class="h-full">
  <Navigation.Menu>
    {#each routes as route (route.href)}
      <Navigation.TriggerAnchor
        href={resolve(route.href, {})}
        title={route.label}
        class={isRouteSelected(route, $page?.url?.pathname) ? 'preset-tonal-primary' : ''}
      >
        <Icon data={route.icon} scale={1.5} />
        <Navigation.TriggerText class="break-words">{route.label}</Navigation.TriggerText>
      </Navigation.TriggerAnchor>
    {/each}
  </Navigation.Menu>
</Navigation>
