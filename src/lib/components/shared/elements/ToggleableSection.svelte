<script lang="ts">
  import { waitAndTick } from '$lib/shared/promise';
  import { SlideToggle } from '@skeletonlabs/skeleton';
  import scrollIntoView from 'scroll-into-view-if-needed';
  import { rollDown } from '../transitions/rollDown';
  import type { Snippet } from 'svelte';

  interface Props {
    name: string;
    label: string;
    title?: string;
    active?: boolean;
    children?: Snippet;
  }

  let { name, label, title = undefined, active = $bindable(false), children }: Props = $props();

  let ref: HTMLDivElement | undefined = $state();

  async function handleToggleChange(): Promise<void> {
    if (active && ref) {
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
    {@render children?.()}
  </div>
{/if}
