<script lang="ts">
  import { onMount, type Snippet } from 'svelte';
  import type { MouseEventHandler } from 'svelte/elements';

  interface Props {
    title: string;
    visible: boolean;
    href?: string;
    children?: Snippet;
    buttonContent?: Snippet;
    onclick?: MouseEventHandler<HTMLElement>;
  }

  let { title, visible = true, href, children, buttonContent, onclick }: Props = $props();

  const buttonClass = 'btn btn-icon btn-icon-sm variant-soft-secondary absolute right-2';

  let wrapper: HTMLDivElement | undefined = $state();

  onMount(() => {
    const input = wrapper?.querySelector('input');
    if (input) {
      input.style.paddingRight = '3rem';
    }
  });
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<div class="flex items-center relative" bind:this={wrapper}>
  {@render children?.()}
  {#if visible}
    {#if href}
      <a class={buttonClass} {href} {title} {onclick}>
        {@render buttonContent?.()}
      </a>
    {:else}
      <button class={buttonClass} {title} {onclick}>
        {@render buttonContent?.()}
      </button>
    {/if}
  {/if}
</div>
