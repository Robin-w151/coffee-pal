<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import { appStore } from '$lib/stores/app';
  import { PUBLIC_APP_MODE } from '$env/static/public';

  export let cardClass: string | undefined = '';

  const appVersion = import.meta.env.APP_VERSION;
  const appCommitHash = import.meta.env.APP_COMMIT_HASH;
  const itemClass = 'grid grid-cols-[subgrid] col-span-2';

  function handleInstallClick(): void {
    appStore.requestAppInstall();
  }
</script>

<Card class={cardClass}>
  <h3 class="h3">Info</h3>
  <div class="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
    <ul class="grid grid-cols-[max-content_max-content] gap-x-8 gap-y-2">
      <li class={itemClass}>
        <span>Version</span>
        <span>
          <a
            href="https://github.com/Robin-w151/coffee-pal/tree/v{appVersion}"
            target="_blank"
            rel="noopener">{appVersion}</a
          >
          {#if PUBLIC_APP_MODE === 'dev'}
            <a
              href="https://github.com/Robin-w151/coffee-pal/tree/{appCommitHash}"
              target="_blank"
              rel="noopener">({appCommitHash})</a
            >
          {/if}
        </span>
      </li>
      <li class={itemClass}>
        <span>Repository</span>
        <a href="https://github.com/Robin-w151/coffee-pal" target="_blank" rel="noopener">GitHub</a>
      </li>
      <li class={itemClass}>
        <span>What's new</span>
        <a href="https://github.com/Robin-w151/coffee-pal/releases" target="_blank" rel="noopener"
          >Releases</a
        >
      </li>
    </ul>
    {#if $appStore.installEvent}
      <button
        class="btn variant-filled-primary"
        title="Install App on the system"
        on:click={handleInstallClick}>Install App</button
      >
    {/if}
  </div>
</Card>
