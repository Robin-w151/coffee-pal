<script lang="ts">
  import { NextcloudLoginClient } from '$lib/services/sync/nextcloud';
  import type { Credentials } from '$lib/models/nextcloud';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { sync } from '$lib/utils/sync';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import Spinner from '../ui/elements/Spinner.svelte';
  import Form from '../ui/elements/form/Form.svelte';
  import Label from '../ui/elements/form/Label.svelte';
  import UrlInput from '../ui/elements/form/UrlInput.svelte';
  import NextcloudLoginModal from './NextcloudLoginModal.svelte';
  import type { UrlInputChange } from '$lib/models/url-input';

  const modalHelper = new ModalHelper(getModalStore());

  let url = $syncStore.connection?.server.url;
  let hostValid = !!url;
  let isConnecting = false;
  let abortLogin: () => void | undefined;

  $: connected = !!$syncStore.connection;
  $: showSpinner = isConnecting || $syncStateStore.isSynchronizing;

  function handleUrlChange({ detail: change }: CustomEvent<UrlInputChange>): void {
    url = change.url;
    hostValid = change.hostValid;
  }

  async function handleConnectClick(): Promise<void> {
    abortLogin?.();

    isConnecting = true;
    const nextcloudClient = new NextcloudLoginClient();
    const { loginUrl, credentials, abort } = await nextcloudClient.login(url!);
    abortLogin = abort;

    handleLoginStart(loginUrl, abort);

    try {
      await handleCredentials(credentials);
    } finally {
      isConnecting = false;
    }
  }

  function handleLoginStart(loginUrl: string, abort: () => void): void {
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
        url: url!,
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
</script>

<div class="flex justify-between items-center">
  <h3 class="h3">Nextcloud Sync</h3>
  {#if showSpinner}
    <Spinner />
  {/if}
</div>
<Form>
  <Label text="Nextcloud Server URL">
    <UrlInput
      url={$syncStore.connection?.server.url}
      placeholder="Nextcloud Server URL, e.g. example.nextcloud.com"
      readonly={connected}
      on:change={handleUrlChange}
    />
  </Label>
  <div class="flex justify-end gap-2">
    {#if connected}
      <button
        class="btn variant-filled-error"
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
        disabled={!hostValid}
        on:click={handleConnectClick}
      >
        Connect
      </button>
    {/if}
  </div>
</Form>
