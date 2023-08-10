<script lang="ts">
  import { NextcloudLoginClient } from '$lib/api/nextcloud';
  import { syncStore } from '$lib/stores/sync';
  import { sync } from '$lib/utils/sync';
  import Label from '../ui/elements/Label.svelte';
  import Spinner from '../ui/elements/Spinner.svelte';

  let url = $syncStore.connection?.server.url ?? '';
  let isConnecting = false;

  $: urlValid = isUrlValid(url);
  $: connected = !!$syncStore.connection;
  $: showSpinner = isConnecting || $syncStore.isSynchronizing;

  async function handleConnectClick(): Promise<void> {
    isConnecting = true;
    const nextcloudClient = new NextcloudLoginClient();
    const { loginName, appPassword } = await nextcloudClient.login(url);
    syncStore.setConnection({
      server: {
        url,
        provider: 'nextcloud',
      },
      credentials: {
        username: loginName,
        password: appPassword,
      },
    });
    isConnecting = false;
  }

  function handleDisconnectClick(): void {
    syncStore.removeConnection();
  }

  function handleSyncClick(): void {
    sync();
  }

  function isUrlValid(url: string): boolean {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/.test(
      url,
    );
  }
</script>

<div class="flex justify-between items-center">
  <h3 class="h3">Nextcloud Sync</h3>
  {#if showSpinner}
    <Spinner />
  {/if}
</div>
<Label text="Nextcloud Server URL">
  <input
    class="input"
    type="text"
    placeholder="Nextcloud Server URL, e.g. https://example.nextcloud.com"
    bind:value={url}
  />
</Label>
<div class="flex justify-end gap-2">
  {#if connected}
    <button
      class="btn variant-soft-error"
      type="button"
      title="Disconnect Nextcloud Sync"
      on:click={handleDisconnectClick}
    >
      Disconnect
    </button>
    <button
      class="btn variant-filled-primary"
      type="button"
      title="Sync app data"
      on:click={handleSyncClick}>Sync</button
    >
  {:else}
    <button
      class="btn variant-filled-primary"
      type="button"
      title="Enable Sync via Nextcloud"
      disabled={!urlValid}
      on:click={handleConnectClick}
    >
      Connect
    </button>
  {/if}
</div>
