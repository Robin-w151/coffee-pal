<script lang="ts">
  import { onMount } from 'svelte';

  export let title: string;
  export let visible = true;

  let wrapper: HTMLDivElement;

  onMount(() => {
    const input = wrapper.querySelector('input')!;
    input.style.paddingRight = '3rem';
  });
</script>

<div class="flex items-center relative" bind:this={wrapper}>
  <slot />
  {#if visible}
    <button
      class="btn btn-icon btn-icon-sm variant-soft-secondary absolute right-2"
      {title}
      on:click
    >
      <slot name="button-content" />
    </button>
  {/if}
</div>
