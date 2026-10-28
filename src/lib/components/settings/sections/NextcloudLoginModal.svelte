<script lang="ts">
  import type { CustomModalProps } from '$lib/services/ui/modal.svelte';

  interface Props extends CustomModalProps<boolean> {
    loginUrl: string;
  }

  let { loginUrl, close }: Props = $props();

  function handleLoginClick(): void {
    close(true);
  }

  function handleCancelClick(): void {
    close(false);
  }
</script>

<div class="card bg-surface-50-950 flex flex-col gap-4 w-full max-w-(--breakpoint-sm) p-4">
  <header class="text-2xl font-bold">Finish Setup</header>
  <article>Please press Login to finish Nextcloud synchronization setup.</article>
  <footer class="flex justify-end gap-2">
    <button class="btn preset-tonal-primary border border-primary-500" onclick={handleCancelClick}
      >Cancel</button
    >
    <!-- eslint-disable svelte/no-navigation-without-resolve -->
    <a
      class="btn preset-filled-primary-500"
      href={loginUrl}
      target="_blank"
      rel="noopener"
      onclick={handleLoginClick}>Login</a
    >
  </footer>
</div>
