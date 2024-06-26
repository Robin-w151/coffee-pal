<script lang="ts">
  import { browser } from '$app/environment';
  import Card from '$lib/components/shared/elements/Card.svelte';
  import ToggleableSection from '$lib/components/shared/elements/ToggleableSection.svelte';
  import { JOURNAL_DB_NAME } from '$lib/config/journal';
  import { MY_COFFEES_DB_NAME } from '$lib/config/myCoffees';
  import { humanReadableMemorySize } from '$lib/shared/ui/formatting';
  import { ModalHelper } from '$lib/shared/ui/modal';
  import { getModalStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  export let cardClass: string | undefined = '';

  const modalHelper = new ModalHelper(getModalStore());
  const itemClass = 'grid grid-cols-subgrid col-span-full';

  let developerSettingsActive = false;
  let estimatedStorageUsage: number | undefined = 0;
  $: estimatedStorageUsageString = estimatedStorageUsage
    ? humanReadableMemorySize(estimatedStorageUsage)
    : 'Unbekannt';

  onMount(async () => {
    estimatedStorageUsage = await getEstimatedUsage();
  });

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

  async function getEstimatedUsage(): Promise<number | undefined> {
    if (!isEstimateSupported()) {
      return;
    }

    const estimate = await navigator.storage.estimate();
    return estimate.usage;
  }

  function isEstimateSupported(): boolean {
    return (
      browser && 'storage' in navigator && navigator.storage && 'estimate' in navigator.storage
    );
  }
</script>

<Card class="@container {cardClass}">
  <ToggleableSection
    name="developer-settings-active"
    label="Toggle Developer Settings"
    title="Developer"
    bind:active={developerSettingsActive}
  >
    <div class="flex flex-col justify-between gap-4">
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
  </ToggleableSection>
</Card>
