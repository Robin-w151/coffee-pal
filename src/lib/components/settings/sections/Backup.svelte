<script lang="ts">
  import { Backup } from '$lib/models/backup';
  import type { ActiveJournalEntry, DeletedJournalEntry } from '$lib/models/journal';
  import type { ActiveCoffeeEntry, DeletedCoffeeEntry } from '$lib/models/myCoffees';
  import { merge } from '$lib/services/sync/merge';
  import { isValid } from '$lib/services/validation/validation';
  import { journalStore } from '$lib/stores/journal';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { readJsonFile, writeJsonFile } from '$lib/shared/file';
  import { ToastHelper } from '$lib/shared/ui/toast';
  import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
  import { FileDropzone, getToastStore } from '@skeletonlabs/skeleton';
  import { DateTime } from 'luxon';
  import { Icon } from 'svelte-awesome';
  import Spinner from '../../shared/elements/Spinner.svelte';
  import Form from '../../shared/elements/form/Form.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';

  const toastHelper = new ToastHelper(getToastStore());

  let files: FileList | undefined = $state();
  let isImporting = $state(false);
  let fileSelected = $derived(files?.length && files.length > 0);

  async function handleExportClick(): Promise<void> {
    const journalEntries = await journalStore.loadAll();
    const coffeeEntries = await myCoffeesStore.loadAll();
    const backup: Backup = {
      journal: { entries: journalEntries },
      myCoffees: { entries: coffeeEntries },
    };
    const fileName = `coffee-pal-backup_${DateTime.now().toISO()?.replaceAll(':', '')}.json`;
    writeJsonFile(fileName, backup);
  }

  async function handleImportClick(): Promise<void> {
    if (!files?.length) {
      return;
    }

    isImporting = true;

    try {
      const backup = (await readJsonFile(files[0])) as Backup;
      await validateBackup(backup);

      const { journal, myCoffees } = backup;

      if (journal) {
        const entries = await journalStore.loadAll();
        const result = merge<ActiveJournalEntry, DeletedJournalEntry>({ entries }, journal);
        journalStore.apply(result.localChanges);
      }

      if (myCoffees) {
        const entries = await myCoffeesStore.loadAll();
        const result = merge<ActiveCoffeeEntry, DeletedCoffeeEntry>({ entries }, myCoffees);
        myCoffeesStore.apply(result.localChanges);
      }

      files = undefined;
      toastHelper.triggerInfo('Importing backup data was successful');
    } catch (error: unknown) {
      toastHelper.triggerError(`Importing backup data failed. ${(error as Error).message}`);
    } finally {
      isImporting = false;
    }
  }

  async function validateBackup(backup: Backup): Promise<void> {
    if ((await isValid(Backup, backup)) !== true) {
      throw new Error(
        'The backup file contains invalid or corrupted data. Please make sure you selected a valid backup file.',
      );
    }
  }
</script>

<Card>
  <div class="flex justify-between items-center">
    <h3 class="h3">Backup</h3>
    {#if isImporting}
      <Spinner />
    {/if}
  </div>
  <Form>
    <FileDropzone name="import-file-input" accept="application/json" bind:files>
      {#snippet lead()}
        <Icon data={faFileArrowUp} scale={1.5} />
      {/snippet}
      {#snippet message()}
        {#if fileSelected}
          <span>{files?.[0].name}</span>
        {:else}
          <span>Click to select file or drag and drop</span>
        {/if}
      {/snippet}
      {#snippet meta()}
        Allowed type: JSON
      {/snippet}
    </FileDropzone>
    <div class="flex justify-end gap-2">
      <button
        class="btn variant-ghost-primary"
        type="button"
        title="Export Data"
        onclick={handleExportClick}>Export</button
      >
      <button
        class="btn variant-filled-primary"
        title="Import Data"
        disabled={!fileSelected}
        onclick={handleImportClick}>Import</button
      >
    </div>
  </Form>
</Card>
