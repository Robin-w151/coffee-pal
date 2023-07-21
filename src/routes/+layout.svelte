<script lang="ts">
  import '@skeletonlabs/skeleton/themes/theme-modern.css';
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  import '../app.scss';

  import { AppBar, AppShell, LightSwitch } from '@skeletonlabs/skeleton';
  import { faMugHot } from '@fortawesome/free-solid-svg-icons';
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import { Icon } from 'svelte-awesome';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar padding="px-8 py-4">
      <svelte:fragment slot="lead">
        <Icon data={faMugHot} scale={1.5} />
      </svelte:fragment>
      <span class="text-2xl">Coffee Pal</span>
      <div class="flex items-center gap-4" slot="trail">
        <a
          class="btn btn-icon variant-soft hover:variant-soft-primary"
          href="https://github.com/Robin-w151/coffee-pal"
          target="_blank"
          rel="noopener"
        >
          <Icon data={faGithub} scale={1.5} />
        </a>
        <LightSwitch />
      </div>
    </AppBar>
  </svelte:fragment>
  <div class="p-4">
    <slot />
  </div>
</AppShell>
