<script lang="ts">
  import { NextcloudLoginClient } from '$lib/services/sync/nextcloud';
  import type { Credentials } from '$lib/models/nextcloud';
  import { syncStore } from '$lib/stores/sync';
  import { syncStateStore } from '$lib/stores/syncState';
  import { ModalHelper } from '$lib/utils/ui/modal';
  import { sync } from '$lib/utils/sync';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import Spinner from '../ui/elements/Spinner.svelte';
  import Form from '../ui/elements/form/Form.svelte';
  import Label from '../ui/elements/form/Label.svelte';
  import UrlInput from '../ui/elements/form/UrlInput.svelte';
  import NextcloudLoginModal from './NextcloudLoginModal.svelte';
  import type { UrlInputChange } from '$lib/models/urlInput';
  import { type Subscription, catchError, finalize, of, tap } from 'rxjs';
  import { onDestroy } from 'svelte';
  import { ToastHelper } from '$lib/utils/ui/toast';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability';

  const modalHelper = new ModalHelper(getModalStore());
  const toastHelper = new ToastHelper(getToastStore());

  let url = $syncStore.connection?.server.url;
  let hostValid = !!url;
  let isConnecting = false;
  let pollSubscription: Subscription | undefined;

  $: connected = !!$syncStore.connection;
  $: showSpinner = isConnecting || $syncStateStore.isSynchronizing;

  onDestroy(() => {
    pollSubscription?.unsubscribe();
  });

  function handleUrlChange({ detail: change }: CustomEvent<UrlInputChange>): void {
    url = change.url;
    hostValid = change.hostValid;
  }

  function handleConnectClick(): void {
    pollSubscription?.unsubscribe();
    isConnecting = true;

    const nextcloudLoginClient = new NextcloudLoginClient();
    const credentials = nextcloudLoginClient.login(url!, handleLoginStart);

    pollSubscription = credentials
      .pipe(
        tap(handleCredentials),
        catchError((error: unknown) => {
          toastHelper.triggerError(`Login failed! ${(error as Error).message}`);
          return of();
        }),
        finalize(() => (isConnecting = false)),
      )
      .subscribe();
  }

  function handleLoginStart(loginUrl: string): void {
    modalHelper.triggerModal(NextcloudLoginModal, {
      props: { loginUrl },
      response: handleLoginCancel,
    });
  }

  function handleLoginCancel(response?: boolean): void {
    if (!response) {
      pollSubscription?.unsubscribe();
    }
  }

  function handleCredentials(credentials: Credentials): void {
    const { loginName, appPassword } = credentials;
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
      <button
        class="btn variant-filled-primary"
        title="Sync app data"
        disabled={!$syncAvailabilityStore.isAvailable}
        on:click={handleSyncClick}>Sync</button
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
