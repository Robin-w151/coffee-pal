<script lang="ts">
  import { faGithub } from '@fortawesome/free-brands-svg-icons';
  import { faBars, faCoffee, faMugHot } from '@fortawesome/free-solid-svg-icons';
  import { AppBar, LightSwitch, popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';
  import CpAppMenu from './CPAppMenu.svelte';

  const popupAppMenu: PopupSettings = {
    event: 'focus-click',
    target: 'popupAppMenu',
    placement: 'bottom-start',
  };
</script>

<AppBar padding="px-4 py-2 md:py-4" shadow="shadow-xl">
  <svelte:fragment slot="lead">
    <button class="btn btn-icon hover:variant-soft-primary md:hidden" use:popup={popupAppMenu}>
      <Icon data={faBars} scale={1.5} />
    </button>
  </svelte:fragment>
  <a class="flex items-center gap-4" href="/">
    <span class="hidden md:block">
      <Icon data={faMugHot} scale={1.5} />
    </span>
    <span class="text-2xl">Coffee Pal</span>
  </a>
  <div class="flex items-center gap-4" slot="trail">
    <LightSwitch />
    <a
      class="btn btn-icon hover:variant-soft-primary"
      href="https://github.com/Robin-w151/coffee-pal"
      target="_blank"
      rel="noopener"
    >
      <Icon data={faGithub} scale={1.5} />
    </a>
  </div>
</AppBar>

<div data-popup="popupAppMenu">
  <CpAppMenu />
  <div class="arrow variant-filled-surface" />
</div>
