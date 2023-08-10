<script lang="ts">
  import type { JournalEntry } from '$lib/models/entry';
  import { calculateRatio } from '$lib/utils/math';
  import { faClose, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Form from '../ui/elements/Form.svelte';
  import Label from '../ui/elements/Label.svelte';
  import ResponsiveButton from '../ui/elements/ResponsiveButton.svelte';

  export let entry: Partial<JournalEntry> = {
    id: uuid(),
    method: '',
    water: undefined,
    waterTemperature: undefined,
    coffee: undefined,
    coffeeType: '',
    grindSettings: '',
    description: '',
    createdAt: '',
    updatedAt: '',
  };
  export let edit = false;

  const dispatch = createEventDispatcher();

  $: methodInputValid = !!entry.method;
  $: waterInputValid = isValidInput(entry.water);
  $: coffeeInputValid = isValidInput(entry.coffee);
  $: formValid = methodInputValid && waterInputValid && coffeeInputValid;

  function handleSaveClick(): void {
    dispatch('save', sanitizeEntry(entry));
  }

  function handleDeleteClick(): void {
    dispatch('delete', entry.id);
  }

  function handleCancelClick(): void {
    dispatch('cancel');
  }

  function isValidInput(value?: number | null): boolean {
    return !!value && value > 0;
  }

  function sanitizeEntry(entry: Partial<JournalEntry>): JournalEntry {
    const sanitizedEntry = { ...entry };
    if (typeof entry.water !== 'number') {
      sanitizedEntry.water = 0;
    }

    if (typeof entry.waterTemperature !== 'number') {
      sanitizedEntry.waterTemperature = undefined;
    }

    if (typeof entry.coffee !== 'number') {
      sanitizedEntry.coffee = 0;
    }

    if (!entry.coffeeType) {
      sanitizedEntry.coffeeType = undefined;
    }

    return sanitizedEntry as JournalEntry;
  }
</script>

<div class="card grid grid-rows-[min-content_1fr] w-full max-w-screen-md max-h-full">
  <div class="flex justify-between items-center p-4">
    <h3 class="h3">{edit ? 'Edit' : 'Add'} Entry</h3>
    <button
      class="btn btn-icon hover:variant-soft-secondary float-right"
      on:click={handleCancelClick}
    >
      <Icon data={faClose} />
    </button>
  </div>
  <Form class="px-4 pb-4 h-full overflow-auto">
    <Label text="Brew method *">
      <input
        class="input"
        type="text"
        placeholder="Brew method, e.g. V60"
        bind:value={entry.method}
      />
    </Label>
    <Label text="Amount of water *">
      <input
        class="input"
        type="number"
        placeholder="Amount of water, e.g. 200"
        bind:value={entry.water}
      />
    </Label>
    <Label text="Amount of coffee *">
      <input
        class="input"
        type="number"
        placeholder="Amount of coffee, e.g. 12"
        bind:value={entry.coffee}
      />
    </Label>
    <Label text="Type of coffee">
      <input
        class="input"
        type="text"
        placeholder="Type of coffee, e.g. Some coffee brand"
        bind:value={entry.coffeeType}
      />
    </Label>
    <Label text="Water temperature">
      <input
        class="input"
        type="number"
        placeholder="Water temperature, e.g. 96"
        bind:value={entry.waterTemperature}
      />
    </Label>
    <Label text="Grind settings">
      <input
        class="input"
        type="text"
        placeholder="Grind settings, e.g. 24 clicks"
        bind:value={entry.grindSettings}
      />
    </Label>
    <Label text="Description">
      <textarea
        class="textarea"
        rows={4}
        placeholder="Description..."
        bind:value={entry.description}
      />
    </Label>
    <div class="flex justify-between items-center gap-4">
      <div class="flex items-center gap-2">
        <span class="badge variant-soft-tertiary h-11 text-base px-4">
          <span class="hidden md:inline">Ratio:&nbsp;</span>
          <span class="!m-0">{calculateRatio(entry.coffee, entry.water) ?? 'unknown'}</span>
        </span>
      </div>
      <div class="flex gap-2">
        {#if edit}
          <ResponsiveButton
            type="button"
            label="Delete"
            variant="variant-soft-error"
            on:click={handleDeleteClick}
          >
            <svelte:fragment slot="icon">
              <Icon data={faTrash} />
            </svelte:fragment>
          </ResponsiveButton>
        {/if}
        <ResponsiveButton
          label="Save"
          disabled={!formValid}
          variant="variant-filled-primary"
          on:click={handleSaveClick}
        >
          <svelte:fragment slot="icon">
            <Icon data={faSave} />
          </svelte:fragment>
        </ResponsiveButton>
      </div>
    </div>
  </Form>
</div>
