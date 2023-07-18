<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-modern.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import '../app.scss';

  import { AppBar, AppShell } from '@skeletonlabs/skeleton';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <h1 class="h1">Coffee Pal</h1>
    </AppBar>
  </svelte:fragment>
  <div class="p-4">
    <slot />
  </div>
</AppShell>
