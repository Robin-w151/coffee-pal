<script lang="ts">
  import { pauseScheduledSync } from '$lib/services/sync/sync';
  import { listenForUpdates } from '$lib/services/updates/updateListener';
  import { ToastHelper } from '$lib/shared/ui/toast';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  const toastHelper = new ToastHelper(getToastStore());

  let isRestarting = false;

  onMount(async () => {
    listenForUpdates(({ restart }) => {
      toastHelper.triggerInfo(
        'A new app version is available. Do you want to update and restart the app now?',
        {
          action: {
            label: 'Restart now',
            response: async () => {
              isRestarting = true;
              pauseScheduledSync();
              restart();
            },
          },
          autohide: false,
        },
      );
    });
  });
</script>

{#if isRestarting}
  <div
    class="flex justify-center items-center fixed top-0 bottom-0 left-0 right-0 z-[9999] bg-surface-100/50 backdrop-blur-sm"
  >
    <div
      class="w-24 h-24 border-8 border-surface-800-100-token !border-t-transparent rounded-full animate-spin"
    />
  </div>
{/if}
