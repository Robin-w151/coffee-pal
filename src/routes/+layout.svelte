<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-modern.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import '../app.scss';

  import { AppBar, AppShell } from '@skeletonlabs/skeleton';
  import CoffeeBeanIcon from '$lib/components/ui/icons/CoffeeBeanIcon.svelte';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <CoffeeBeanIcon />
      </svelte:fragment>
      <span class="text-2xl">Coffee Pal</span>
    </AppBar>
  </svelte:fragment>
  <div class="p-4">
    <slot />
  </div>
</AppShell>
