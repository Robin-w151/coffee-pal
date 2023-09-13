<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faClose, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
  import { InputChip } from '@skeletonlabs/skeleton';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Form from '../ui/elements/Form.svelte';
  import Label from '../ui/elements/Label.svelte';
  import ResponsiveButton from '../ui/elements/ResponsiveButton.svelte';
  import { installEventHandler } from '$lib/utils/events';

  export let entry: Partial<ActiveCoffeeEntry> = {
    id: uuid(),
    name: '',
    origin: undefined,
    trader: undefined,
    aromas: [],
    description: '',
    createdAt: '',
    updatedAt: '',
  };
  export let edit = false;

  const dispatch = createEventDispatcher();

  $: nameInputValid = !!entry.name;
  $: formValid = nameInputValid;

  function handleSaveClick(): void {
    dispatch('save', sanitizeEntry(entry));
  }

  function handleRemoveClick(): void {
    dispatch('remove', entry.id);
  }

  function handleCancelClick(): void {
    dispatch('cancel');
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function sanitizeEntry(entry: Partial<ActiveCoffeeEntry>): ActiveCoffeeEntry {
    const sanitizedEntry = { ...entry };

    if (!sanitizedEntry.origin) {
      sanitizedEntry.origin = undefined;
    }

    if (!sanitizedEntry.trader) {
      sanitizedEntry.trader = undefined;
    }

    if (!sanitizedEntry.aromas || sanitizedEntry.aromas.length === 0) {
      sanitizedEntry.aromas = [];
    }

    if (!sanitizedEntry.description) {
      sanitizedEntry.description = undefined;
    }

    return sanitizedEntry as ActiveCoffeeEntry;
  }
</script>

<div class="card grid grid-rows-[min-content_1fr] w-full max-w-screen-md max-h-full">
  <div class="flex justify-between items-center p-4">
    <h3 class="h3">{edit ? 'Edit' : 'Add'} Entry</h3>
    <button
      class="btn btn-icon hover:variant-soft-secondary float-right"
      title="Close"
      on:click={handleCancelClick}
    >
      <Icon data={faClose} />
      <span class="sr-only">Close</span>
    </button>
  </div>
  <Form class="px-4 pb-4 h-full overflow-auto">
    <Label text="Name *">
      <input
        class="input"
        type="text"
        placeholder="Name, e.g. Frutos Rojos"
        bind:value={entry.name}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <Label text="Origin">
      <input
        class="input"
        type="text"
        placeholder="Origin, e.g. Colombia"
        bind:value={entry.origin}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <Label text="Trader">
      <input
        class="input"
        type="text"
        placeholder="Trader, e.g. Alt Wien"
        bind:value={entry.trader}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <Label text="Aromas">
      <div
        use:installEventHandler={{
          selector: 'input',
          event: 'keydown',
          handler: handleInputKeydown,
        }}
      >
        <InputChip
          name="aromas"
          placeholder="Aromas, e.g. Nutty, Dried Fruit"
          padding="px-3 py-2"
          chips="variant-filled-primary"
          bind:value={entry.aromas}
          on:keydown={handleInputKeydown}
        />
      </div>
    </Label>
    <Label text="Description">
      <textarea
        class="textarea"
        rows={4}
        placeholder="Description..."
        bind:value={entry.description}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <div class="flex justify-end items-center gap-2">
      {#if edit}
        <ResponsiveButton
          type="button"
          label="Delete"
          variant="variant-soft-error"
          on:click={handleRemoveClick}
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
  </Form>
</div>
