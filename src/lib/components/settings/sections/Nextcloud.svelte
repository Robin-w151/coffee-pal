<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import type { Credentials } from '$lib/models/nextcloud';
  import type { UrlInputChange } from '$lib/models/urlInput';
  import { NextcloudLoginClient } from '$lib/services/sync/nextcloud';
  import { sync } from '$lib/services/sync/sync';
  import { ModalHelper } from '$lib/shared/ui/modal';
  import { ToastHelper } from '$lib/shared/ui/toast';
  import { syncStore } from '$lib/stores/sync';
  import { syncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import { syncStateStore } from '$lib/stores/syncState.svelte';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { catchError, finalize, of, tap, type Subscription } from 'rxjs';
  import { onDestroy } from 'svelte';
  import Spinner from '../../shared/elements/Spinner.svelte';
  import Form from '../../shared/elements/form/Form.svelte';
  import Label from '../../shared/elements/form/Label.svelte';
  import UrlInput from '../../shared/elements/form/UrlInput.svelte';
  import NextcloudLoginModal from './NextcloudLoginModal.svelte';
  import { DateTime } from 'luxon';

  const modalHelper = new ModalHelper(getModalStore());
  const toastHelper = new ToastHelper(getToastStore());

  let url = $syncStore.connection?.server.url;
  let hostValid = $state(!!url);
  let isConnecting = $state(false);
  let pollSubscription: Subscription | undefined;
  let connected = $derived(!!$syncStore.connection);
  let showSpinner = $derived(isConnecting || syncStateStore.isSynchronizing);
  let lastSyncText = $derived.by(() => {
    const lastSync = $syncStore.connection?.lastSync;
    if (!lastSync) {
      return;
    }

    const parsedLastSync = DateTime.fromISO(lastSync);
    if (!parsedLastSync.isValid) {
      return;
    }

    return `Last sync: ${parsedLastSync.toFormat('dd.MM.yyyy, HH:mm')}`;
  });

  onDestroy(() => {
    pollSubscription?.unsubscribe();
  });

  function handleUrlChange(change: UrlInputChange): void {
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

  function handleCancelClick(): void {
    pollSubscription?.unsubscribe();
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
    sync();
  }

  function handleDisconnectClick(): void {
    syncStore.removeConnection();
  }

  function handleSyncClick(): void {
    sync();
  }
</script>

<Card>
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
        onChange={handleUrlChange}
      />
    </Label>
    <div class="flex justify-end gap-2">
      {#if connected}
        <button
          class="btn variant-filled-error"
          type="button"
          title="Disconnect Nextcloud Sync"
          onclick={handleDisconnectClick}
        >
          Disconnect
        </button>
        <button
          class="btn variant-filled-primary"
          title="Synchronize data{lastSyncText ? `\n${lastSyncText}` : ''}"
          disabled={!$syncAvailabilityStore.isAvailable}
          onclick={handleSyncClick}>Sync</button
        >
      {:else if showSpinner}
        <button class="btn variant-filled-error" title="Cancel Setup" onclick={handleCancelClick}>
          Cancel
        </button>
      {:else}
        <button
          class="btn variant-filled-primary"
          title="Enable Sync via Nextcloud"
          disabled={!hostValid}
          onclick={handleConnectClick}
        >
          Connect
        </button>
      {/if}
    </div>
  </Form>
</Card>
