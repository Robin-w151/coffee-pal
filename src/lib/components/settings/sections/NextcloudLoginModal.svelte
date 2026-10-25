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

<div class="card flex flex-col gap-4 w-full max-w-screen-sm p-4">
  <header class="text-2xl font-bold">Finish Setup</header>
  <article>Please press Login to finish Nextcloud synchronization setup.</article>
  <footer class="flex justify-end gap-2">
    <button class="btn variant-ghost-primary" onclick={handleCancelClick}>Cancel</button>
    <!-- eslint-disable svelte/no-navigation-without-resolve -->
    <a
      class="btn variant-filled-primary"
      href={loginUrl}
      target="_blank"
      rel="noopener"
      onclick={handleLoginClick}>Login</a
    >
  </footer>
</div>
