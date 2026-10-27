<script lang="ts">
  import { Backup } from '$lib/models/backup';
  import type { ActiveJournalEntry, DeletedJournalEntry } from '$lib/models/journal';
  import type { ActiveCoffeeEntry, DeletedCoffeeEntry } from '$lib/models/myCoffees';
  import { merge } from '$lib/services/sync/merge';
  import { isValid } from '$lib/services/validation/validation';
  import { journalStore } from '$lib/stores/journal';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { readJsonFile, writeJsonFile } from '$lib/shared/file';
  import { toast } from '$lib/services/ui/toast.svelte';
  import { DateTime } from 'luxon';
  import Spinner from '../../shared/elements/Spinner.svelte';
  import Form from '../../shared/elements/form/Form.svelte';
  import Card from '$lib/components/shared/elements/Card.svelte';
  import FileUpload from '$lib/components/shared/ui/FileUpload.svelte';

  let file: File | undefined = $state();
  let isImporting = $state(false);
  const fileSelected = $derived(!!file);

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
    if (!file) {
      return;
    }

    isImporting = true;

    try {
      const backup = (await readJsonFile(file)) as Backup;
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

      file = undefined;
      toast.info('Importing backup data was successful');
    } catch (error: unknown) {
      toast.error(`Importing backup data failed. ${(error as Error).message}`);
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
    <FileUpload
      name="import-file-input"
      accept="application/json"
      hint="Allowed type: JSON"
      bind:file
    />
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
