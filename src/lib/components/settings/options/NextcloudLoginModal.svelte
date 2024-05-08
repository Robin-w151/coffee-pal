<script lang="ts">
  import { getModalStore } from '@skeletonlabs/skeleton';

  export let loginUrl: string;

  const modalStore = getModalStore();

  function handleLoginClick(): void {
    $modalStore[0].response?.(true);
    modalStore.close();
  }

  function handleCancelClick(): void {
    $modalStore[0].response?.(false);
    modalStore.close();
  }
</script>

<div class="card flex flex-col gap-4 w-full max-w-screen-sm p-4">
  <header class="text-2xl font-bold">Finish Setup</header>
  <article>Please press Login to finish Nextcloud synchronization setup.</article>
  <div class="flex justify-end gap-4">
    <button class="btn variant-ghost-primary" on:click={handleCancelClick}>Cancel</button>
    <a
      class="btn variant-filled-primary"
      href={loginUrl}
      target="_blank"
      rel="noopener"
      on:click={handleLoginClick}>Login</a
    >
  </div>
</div>
