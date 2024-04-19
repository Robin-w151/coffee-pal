<script lang="ts">
  import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let title: string;
  export let isLoading = false;
  export let showBack = false;

  const dispatch = createEventDispatcher();

  function handleBackClick(): void {
    dispatch('back');
  }
</script>

<header class="flex items-center gap-4 px-2 w-full h-12">
  {#if isLoading}
    <div class="flex gap-4 w-full h-10 animate-pulse">
      {#if showBack}
        <div class="placeholder-circle w-10 h-10" />
      {/if}
      <div class="placeholder w-48 h-10" />
    </div>
  {:else}
    {#if showBack}
      <button
        class="btn btn-icon variant-ghost-primary flex-[0_0_auto]"
        title="Go back"
        on:click={handleBackClick}
      >
        <Icon data={faArrowLeft} />
      </button>
    {/if}
    <h2 class="page-header-title">
      <span>{title}</span>
    </h2>
  {/if}
</header>
