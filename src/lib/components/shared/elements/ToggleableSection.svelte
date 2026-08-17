<script lang="ts">
  import { waitAndTick } from '$lib/shared/promise';
  import { Switch } from '@skeletonlabs/skeleton-svelte';
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

  function handleCheckedChange(details: { checked: boolean }): void {
    active = details.checked;

    if (active) {
      // onCheckedChange expects a void return, so the scroll is deliberately
      // not awaited here.
      void scrollSectionIntoView();
    }
  }

  async function scrollSectionIntoView(): Promise<void> {
    await waitAndTick(150);

    if (ref) {
      scrollIntoView(ref, {
        scrollMode: 'always',
        behavior: 'smooth',
      });
    }
  }
</script>

<div class="flex items-center gap-2" bind:this={ref}>
  <Switch {name} checked={active} onCheckedChange={handleCheckedChange}>
    <Switch.Control>
      <Switch.Thumb />
    </Switch.Control>
    <Switch.Label class="sr-only">{label}</Switch.Label>
    <Switch.HiddenInput />
  </Switch>
  <h3 class="h3">{title || label}</h3>
</div>
{#if active}
  <div transition:rollDown>
    {@render children?.()}
  </div>
{/if}
