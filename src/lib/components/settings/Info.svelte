<script lang="ts">
  import { appStore } from '$lib/stores/app';

  const appVersion = import.meta.env.APP_VERSION;
  const appCommitHash = import.meta.env.APP_COMMIT_HASH;
  const itemClass = 'grid grid-cols-[subgrid] col-span-2';

  function handleKeepDataClick(): void {
    appStore.requestPersistentStorage();
  }

  function handleInstallClick(): void {
    appStore.requestAppInstall();
  }
</script>

<h3 class="h3">Info</h3>
<div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
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
  <div class="flex flex-col sm:flex-row gap-2">
    <button
      class="btn variant-ghost-primary"
      title="Request that data is stored until manual removal"
      disabled={$appStore.persistentStorage}
      on:click={handleKeepDataClick}
      >{$appStore.persistentStorage ? 'Data is persisted' : 'Keep Data'}</button
    >
    {#if $appStore.installEvent}
      <button
        class="btn variant-filled-primary"
        title="Install App on the system"
        on:click={handleInstallClick}>Install App</button
      >
    {/if}
  </div>
</div>
