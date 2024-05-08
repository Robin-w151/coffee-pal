<script lang="ts">
  import { onMount } from 'svelte';

  export let title: string;
  export let visible = true;
  export let href: string | undefined = undefined;

  const buttonClass = 'btn btn-icon btn-icon-sm variant-soft-secondary absolute right-2';

  let wrapper: HTMLDivElement;

  onMount(() => {
    const input = wrapper.querySelector('input')!;
    input.style.paddingRight = '3rem';
  });
</script>

<div class="flex items-center relative" bind:this={wrapper}>
  <slot />
  {#if visible}
    {#if href}
      <a class={buttonClass} {href} {title} on:click>
        <slot name="button-content" />
      </a>
    {:else}
      <button class={buttonClass} {title} on:click>
        <slot name="button-content" />
      </button>
    {/if}
  {/if}
</div>
