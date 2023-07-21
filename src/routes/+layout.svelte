<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-modern.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import '../app.scss';

  import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
  import { faMugHot } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar padding="px-8 py-4">
      <svelte:fragment slot="lead">
        <Icon data={faMugHot} scale={1.3} />
      </svelte:fragment>
      <span class="text-2xl">Coffee Pal</span>
      <svelte:fragment slot="trail">
        <LightSwitch />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>
  <div class="p-4">
    <slot />
  </div>
</AppShell>
