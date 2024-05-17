<script lang="ts">
  import { browser } from '$app/environment';
  import Card from '$lib/components/shared/elements/Card.svelte';
  import { rollDown } from '$lib/components/shared/transitions/rollDown';
  import { JOURNAL_DB_NAME } from '$lib/config/journal';
  import { MY_COFFEES_DB_NAME } from '$lib/config/myCoffees';
  import { humanReadableMemorySize } from '$lib/shared/ui/formatting';
  import { ModalHelper } from '$lib/shared/ui/modal';
  import { SlideToggle, getModalStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  export let cardClass: string | undefined = '';

  const modalHelper = new ModalHelper(getModalStore());
  const itemClass = 'grid grid-cols-[subgrid] col-span-2';

  let developerSettingsActive = false;
  let estimatedStorageUsage: number | undefined = 0;
  $: estimatedStorageUsageString = estimatedStorageUsage
    ? humanReadableMemorySize(estimatedStorageUsage)
    : 'Unbekannt';

  onMount(async () => {
    estimatedStorageUsage = await getEstimatedUsage();
  });

  function isEstimateSupported(): boolean {
    return (
      browser && 'storage' in navigator && navigator.storage && 'estimate' in navigator.storage
    );
  }

  async function getEstimatedUsage(): Promise<number | undefined> {
    if (!isEstimateSupported()) {
      return;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage;
  }

  async function handleResetLocalStorageButtonClick() {
    const confirmed = await modalHelper.triggerConfirm(
      'Data will be deleted',
      'Are you sure that you want to clear the LocalStorage?',
      {
        modalClasses: 'dangerous',
      },
    );

    if (confirmed) {
      localStorage.clear();
      location.reload();
    }
  }

  async function handleResetIndexedDbButtonClick() {
    const confirmed = await modalHelper.triggerConfirm(
      'Data will be deleted',
      'Are you sure that you want to clear the IndexedDB?',
      {
        modalClasses: 'dangerous',
      },
    );

    if (confirmed) {
      indexedDB.deleteDatabase(JOURNAL_DB_NAME);
      indexedDB.deleteDatabase(MY_COFFEES_DB_NAME);
      location.reload();
    }
  }
</script>

<Card class="@container {cardClass}">
  <div class="flex items-center gap-2">
    <SlideToggle
      name="developer-settings-active"
      label="Toggle Developer Settings"
      size="sm"
      active="slide-toggle-active-token"
      bind:checked={developerSettingsActive}
    />
    <h3 class="h3">Developer</h3>
  </div>
  {#if developerSettingsActive}
    <div class="flex flex-col justify-between gap-4" transition:rollDown>
      <ul class="grid grid-cols-[max-content_max-content] gap-x-8 gap-y-2">
        <li class={itemClass}>
          <span>Storage use</span>
          <strong>{estimatedStorageUsageString}</strong>
        </li>
      </ul>
      <div class="flex flex-col @md:flex-row gap-2 w-full">
        <button
          class="btn variant-filled-error"
          title="Clear LocalStorage"
          on:click={handleResetLocalStorageButtonClick}
        >
          Clear LocalStorage
        </button>
        <button
          class="btn variant-filled-error"
          title="Clear LocalStorage"
          on:click={handleResetIndexedDbButtonClick}
        >
          Clear IndexedDB
        </button>
      </div>
    </div>
  {/if}
</Card>
