<script lang="ts">
  import type { Backup } from '$lib/models/backup';
  import {
    isActiveJournalEntry,
    type ActiveJournalEntry,
    type DeletedJournalEntry,
  } from '$lib/models/journal';
  import {
    isActiveCoffeeEntry,
    type ActiveCoffeeEntry,
    type DeletedCoffeeEntry,
  } from '$lib/models/myCoffees';
  import { journalStore } from '$lib/stores/journal';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { readJsonFile, writeJsonFile } from '$lib/utils/file';
  import { mapToJournal, mapToMyCoffees } from '$lib/utils/mapper';
  import { mergeSyncables } from '$lib/utils/sync';
  import { triggerError, triggerInfo } from '$lib/utils/toast';
  import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
  import { FileDropzone } from '@skeletonlabs/skeleton';
  import { DateTime } from 'luxon';
  import { Icon } from 'svelte-awesome';
  import Form from '../ui/elements/Form.svelte';

  let files: FileList | undefined;

  $: fileSelected = files?.length && files.length > 0;

  function handleExportClick(): void {
    const backup: Backup = {
      journal: mapToJournal($journalStore),
      myCoffees: mapToMyCoffees($myCoffeesStore),
    };
    const fileName = `coffee-pal-backup_${DateTime.now().toISO()?.replaceAll(':', '')}.json`;
    writeJsonFile(fileName, backup);
  }

  async function handleImportClick(): Promise<void> {
    if (!files?.length) {
      return;
    }

    try {
      const backup = await readJsonFile(files[0]);
      checkValidBackup(backup);

      const { journal, myCoffees } = backup;

      if (journal) {
        const result = mergeSyncables<ActiveJournalEntry, DeletedJournalEntry>(
          $journalStore,
          journal,
        );
        journalStore.apply(result.localChanges);
      }

      if (myCoffees) {
        const result = mergeSyncables<ActiveCoffeeEntry, DeletedCoffeeEntry>(
          $myCoffeesStore,
          myCoffees,
        );
        myCoffeesStore.apply(result.localChanges);
      }

      files = undefined;
      triggerInfo('Importing backup data was successful');
    } catch (error) {
      triggerError('Importing backup data failed. Make sure you selected the correct file!');
    }
  }

  function checkValidBackup(backup: Backup): void {
    const emptyMessage = 'Backup empty!';
    const corruptedMessage = 'Backup data corrupted!';

    if (!backup) {
      throw new Error(emptyMessage);
    }

    const { journal, myCoffees } = backup;

    if (journal && !Array.isArray(journal.entries)) {
      throw new Error(corruptedMessage);
    }

    if (journal) {
      for (const entry of journal.entries) {
        if (!isActiveJournalEntry(entry)) {
          throw new Error(corruptedMessage);
        }
      }
    }

    if (myCoffees && !Array.isArray(myCoffees.entries)) {
      throw new Error(corruptedMessage);
    }

    if (myCoffees) {
      for (const entry of myCoffees.entries) {
        if (!isActiveCoffeeEntry(entry)) {
          throw new Error(corruptedMessage);
        }
      }
    }
  }
</script>

<h3 class="h3">Backup</h3>
<Form>
  <FileDropzone name="import-file-input" accept="application/json" bind:files>
    <svelte:fragment slot="lead">
      <Icon data={faFileArrowUp} scale={1.5} />
    </svelte:fragment>
    <svelte:fragment slot="message">
      {#if fileSelected}
        <span>{files?.[0].name}</span>
      {:else}
        <span>Click to select file or drag and drop</span>
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="meta">Allowed type: JSON</svelte:fragment>
  </FileDropzone>
  <div class="flex justify-end gap-2">
    <button
      class="btn variant-filled-secondary"
      type="button"
      title="Export Data"
      on:click={handleExportClick}>Export</button
    >
    <button
      class="btn variant-filled-primary"
      title="Import Data"
      disabled={!fileSelected}
      on:click={handleImportClick}>Import</button
    >
  </div>
</Form>
