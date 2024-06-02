<script lang="ts">
  import { waitAndTick } from '$lib/shared/promise';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import scrollIntoView from 'scroll-into-view-if-needed';
  import { rollDown } from '../transitions/rollDown';

  export let name: string;
  export let label: string;
  export let title: string | undefined = undefined;
  export let active = false;

  let ref: HTMLDivElement;

  async function handleToggleChange(): Promise<void> {
    if (active) {
      await waitAndTick(150);
      scrollIntoView(ref, {
        scrollMode: 'always',
        behavior: 'smooth',
      });
    }
  }
</script>

<div class="flex items-center gap-2" bind:this={ref}>
  <SlideToggle
    {name}
    {label}
    size="sm"
    active="slide-toggle-active-token"
    bind:checked={active}
    on:change={handleToggleChange}
  />
  <h3 class="h3">{title || label}</h3>
</div>
{#if active}
  <div transition:rollDown>
    <slot />
  </div>
{/if}
