<script lang="ts">
  import { NextcloudLoginClient } from '$lib/api/nextcloud';
  import type { Credentials } from '$lib/models/nextcloud';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { ModalHelper } from '$lib/utils/modal';
  import { sync } from '$lib/utils/sync';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import Form from '../ui/elements/Form.svelte';
  import Label from '../ui/elements/Label.svelte';
  import Spinner from '../ui/elements/Spinner.svelte';
  import NextcloudLoginModal from './NextcloudLoginModal.svelte';

  const modalHelper = new ModalHelper(getModalStore());

  let url = $syncStore.connection?.server.url ?? '';
  let isConnecting = false;
  let abortLogin: () => void | undefined;

  $: urlValid = isUrlValid(url);
  $: connected = !!$syncStore.connection;
  $: showSpinner = isConnecting || $syncStateStore.isSynchronizing;

  async function handleConnectClick(): Promise<void> {
    abortLogin?.();

    isConnecting = true;
    const nextcloudClient = new NextcloudLoginClient();
    const { loginUrl, credentials, abort } = await nextcloudClient.login(url);
    abortLogin = abort;

    handleLoginUrl(loginUrl, abort);

    try {
      await handleCredentials(credentials);
    } finally {
      isConnecting = false;
    }
  }

  function handleLoginUrl(loginUrl: string, abort: () => void): void {
    modalHelper.triggerModal(NextcloudLoginModal, {
      props: { loginUrl },
      response: handleLoginCancel.bind(null, abort),
    });
  }

  function handleLoginCancel(abort: () => void, response?: boolean): void {
    if (!response) {
      abort();
    }
  }

  async function handleCredentials(credentials: Promise<Credentials>): Promise<void> {
    const { loginName, appPassword } = await credentials;
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
  }

  function handleDisconnectClick(): void {
    syncStore.removeConnection();
  }

  function handleSyncClick(): void {
    sync();
  }

  function isUrlValid(url: string): boolean {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_+.~#?&//=]*)/.test(
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
<Form>
  <Label text="Nextcloud Server URL">
    <input
      class="input"
      type="url"
      placeholder="Nextcloud Server URL, e.g. https://example.nextcloud.com"
      readonly={connected}
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
      <button class="btn variant-filled-primary" title="Sync app data" on:click={handleSyncClick}
        >Sync</button
      >
    {:else}
      {#if url}
        <a class="btn variant-soft-primary" href={url} target="_blank" rel="noopener">Open</a>
      {/if}
      <button
        class="btn variant-filled-primary"
        title="Enable Sync via Nextcloud"
        disabled={!urlValid}
        on:click={handleConnectClick}
      >
        Connect
      </button>
    {/if}
  </div>
</Form>
