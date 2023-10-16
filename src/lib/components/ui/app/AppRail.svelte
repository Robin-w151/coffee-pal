<script lang="ts">
  import { page } from '$app/stores';
  import { routes } from '$lib/config/routes';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';
</script>

<AppRail
  background="bg-surface-50-900-token"
  hover="bg-primary-hover-token"
  active="bg-primary-active-token"
>
  {#each routes as { href, label, icon } (href)}
    <AppRailAnchor {href} title={label} selected={$page.url.pathname === href} regionLabel="px-1">
      <svelte:fragment slot="lead">
        <Icon data={icon} scale={1.5} />
      </svelte:fragment>
      <span class="break-words">{label}</span>
    </AppRailAnchor>
  {/each}
</AppRail>
