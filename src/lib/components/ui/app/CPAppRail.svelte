<script lang="ts">
  import { faCalculator, faClipboardList } from '@fortawesome/free-solid-svg-icons';
  import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';
  import { page } from '$app/stores';
</script>

<AppRail
  background="bg-surface-50-900-token"
  hover="bg-primary-hover-token"
  active="bg-primary-active-token"
>
  <AppRailAnchor href="/" title="Calculator" selected={$page.url.pathname === '/'}>
    <svelte:fragment slot="lead">
      <Icon data={faCalculator} scale={1.5} />
    </svelte:fragment>
    <span>Calculator</span>
  </AppRailAnchor>
  <AppRailAnchor href="/journal" title="Journal" selected={$page.url.pathname === '/journal'}>
    <svelte:fragment slot="lead">
      <Icon data={faClipboardList} scale={1.5} />
    </svelte:fragment>
    <span>Journal</span>
  </AppRailAnchor>
</AppRail>
