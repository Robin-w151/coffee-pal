<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/stores';
  import { routes } from '$lib/config/routes';
  import { isRouteSelected } from '$lib/shared/ui/route';
  import { appMenu } from '$lib/stores/appMenu.svelte';
  import { faClose } from '@fortawesome/free-solid-svg-icons';
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';
</script>

<Navigation layout="sidebar" class="h-full">
  <Navigation.Header class="flex justify-between items-center">
    <h2 class="h2">Coffee Pal</h2>
    <button
      class="btn btn-icon hover:preset-tonal-secondary"
      title="Close menu"
      onclick={() => appMenu.hide()}
    >
      <Icon data={faClose} />
      <span class="sr-only">Close menu</span>
    </button>
  </Navigation.Header>
  <hr class="hr" />
  <Navigation.Content>
    <Navigation.Menu>
      {#each routes as route (route.href)}
        <Navigation.TriggerAnchor
          href={resolve(route.href, {})}
          class={isRouteSelected(route, $page?.url?.pathname) ? 'preset-tonal-primary' : ''}
          onclick={() => appMenu.hide()}
        >
          <span class="flex items-center justify-center w-5">
            <Icon data={route.icon} />
          </span>
          <Navigation.TriggerText>{route.label}</Navigation.TriggerText>
        </Navigation.TriggerAnchor>
      {/each}
    </Navigation.Menu>
  </Navigation.Content>
</Navigation>
