<script lang="ts">
  import Card from '$lib/components/shared/elements/Card.svelte';
  import type { Credentials } from '$lib/models/nextcloud';
  import type { UrlInputChange } from '$lib/models/urlInput';
  import { NextcloudLoginClient } from '$lib/services/sync/nextcloud';
  import { sync } from '$lib/services/sync/sync';
  import { modal } from '$lib/services/ui/modal.svelte';
  import { toast } from '$lib/services/ui/toast.svelte';
  import { getSyncStore } from '$lib/stores/sync.svelte';
  import { getSyncAvailabilityStore } from '$lib/stores/syncAvailability.svelte';
  import { syncStateStore } from '$lib/stores/syncState.svelte';
  import { catchError, finalize, of, tap, type Subscription } from 'rxjs';
  import { onDestroy } from 'svelte';
  import Spinner from '../../shared/elements/Spinner.svelte';
  import Form from '../../shared/elements/form/Form.svelte';
  import Label from '../../shared/elements/form/Label.svelte';
  import UrlInput from '../../shared/elements/form/UrlInput.svelte';
  import NextcloudLoginModal from './NextcloudLoginModal.svelte';
  import { DateTime } from 'luxon';

  const syncStore = getSyncStore();
  const syncAvailabilityStore = getSyncAvailabilityStore();

  let url = syncStore.connection?.server.url;
  let hostValid = $state(!!url);
  let isConnecting = $state(false);
  let pollSubscription: Subscription | undefined;
  const connected = $derived(!!syncStore.connection);
  const showSpinner = $derived(isConnecting || syncStateStore.isSynchronizing);
  const lastSyncText = $derived.by(() => {
    const lastSync = syncStore.connection?.lastSync;
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
          toast.error(`Login failed! ${(error as Error).message}`);
          return of();
        }),
        finalize(() => (isConnecting = false)),
      )
      .subscribe();
  }

  function handleCancelClick(): void {
    pollSubscription?.unsubscribe();
  }

  async function handleLoginStart(loginUrl: string): Promise<void> {
    const confirmed = await modal.open(NextcloudLoginModal, { loginUrl });
    if (!confirmed) {
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
    sync(syncStore);
  }

  function handleDisconnectClick(): void {
    syncStore.removeConnection();
  }

  function handleSyncClick(): void {
    sync(syncStore);
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
        url={syncStore.connection?.server.url}
        placeholder="Nextcloud Server URL, e.g. example.nextcloud.com"
        readonly={connected}
        onChange={handleUrlChange}
      />
    </Label>
    <div class="flex justify-end gap-2">
      {#if connected}
        <button
          class="btn preset-filled-error-500"
          type="button"
          title="Disconnect Nextcloud Sync"
          onclick={handleDisconnectClick}
        >
          Disconnect
        </button>
        <button
          class="btn preset-filled-primary-500"
          title="Synchronize data{lastSyncText ? `\n${lastSyncText}` : ''}"
          disabled={!syncAvailabilityStore.isAvailable}
          onclick={handleSyncClick}>Sync</button
        >
      {:else if showSpinner}
        <button
          class="btn preset-filled-error-500"
          title="Cancel Setup"
          onclick={handleCancelClick}
        >
          Cancel
        </button>
      {:else}
        <button
          class="btn preset-filled-primary-500"
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
