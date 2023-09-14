<script lang="ts">
  import { installEventStore } from '$lib/stores/app';

  const appVersion = import.meta.env.APP_VERSION;
  const appCommitHash = import.meta.env.APP_COMMIT_HASH;
  const itemClass = 'grid grid-cols-[subgrid] col-span-2';

  function handleInstallClick(): void {
    ($installEventStore as any)?.prompt();
    installEventStore.clear();
  }
</script>

<h3 class="h3">Info</h3>
<div class="flex justify-between items-end">
  <ul class="grid grid-cols-[max-content_max-content] gap-x-8 gap-y-2">
    <li class={itemClass}>
      <span>Version</span>
      <a
        href="https://github.com/Robin-w151/coffee-pal/tree/{appCommitHash}"
        target="_blank"
        rel="noopener">{appVersion} ({appCommitHash})</a
      >
    </li>
    <li class={itemClass}>
      <span>Repository</span>
      <a href="https://github.com/Robin-w151/coffee-pal" target="_blank" rel="noopener">GitHub</a>
    </li>
  </ul>
  {#if $installEventStore}
    <button class="btn variant-filled-primary" on:click={handleInstallClick}>Install App</button>
  {/if}
</div>
