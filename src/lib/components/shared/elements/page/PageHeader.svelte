<script lang="ts">
  import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
  import { tick } from 'svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    title: string;
    isLoading?: boolean;
    showBack?: boolean;
    onBack?: () => void;
  }

  let { title, isLoading = false, showBack = false, onBack }: Props = $props();

  let backButton = $state<HTMLButtonElement | undefined>(undefined);

  export async function focusBackButton(): Promise<void> {
    if (showBack) {
      await tick();
      backButton?.focus();
    }
  }

  function handleBackClick(): void {
    onBack?.();
  }
</script>

<header class="flex items-center gap-4 px-2 w-full h-12">
  {#if isLoading}
    <div class="flex gap-4 w-full h-10 animate-pulse">
      {#if showBack}
        <div class="placeholder-circle w-10 h-10"></div>
      {/if}
      <div class="placeholder w-48 h-10"></div>
    </div>
  {:else}
    {#if showBack}
      <button
        class="btn btn-icon variant-ghost-primary flex-[0_0_auto]"
        title="Go back"
        bind:this={backButton}
        onclick={handleBackClick}
      >
        <Icon data={faArrowLeft} />
      </button>
    {/if}
    <h2 class="page-header-title">
      <span>{title}</span>
    </h2>
  {/if}
</header>
