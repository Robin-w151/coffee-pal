<script lang="ts">
  import { listenForUpdates } from '$lib/services/updates/updateListener';
  import { ToastHelper } from '$lib/utils/ui/toast';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  const toastHelper = new ToastHelper(getToastStore());

  let isRefreshing = false;
  let isRestarting = false;

  onMount(async () => {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (isRefreshing) {
        return;
      }

      isRefreshing = true;
      window.location.reload();
    });

    listenForUpdates(({ restart }) => {
      toastHelper.triggerInfo(
        'A new app version is available. Do you want to update and restart the app now?',
        {
          action: {
            label: 'Restart now',
            response: async () => {
              isRestarting = true;
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
