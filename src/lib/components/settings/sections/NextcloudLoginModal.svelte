<script lang="ts">
  interface Props {
    loginUrl: string;
    close: (response?: boolean) => void;
  }

  let { loginUrl, close }: Props = $props();

  function handleLoginClick(): void {
    close(true);
  }

  function handleCancelClick(): void {
    close(false);
  }
</script>

<div class="card flex flex-col gap-4 w-full max-w-(--breakpoint-sm) p-4">
  <header class="text-2xl font-bold">Finish Setup</header>
  <article>Please press Login to finish Nextcloud synchronization setup.</article>
  <footer class="flex justify-end gap-2">
    <button class="btn preset-outlined-primary-500" onclick={handleCancelClick}>Cancel</button>
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
