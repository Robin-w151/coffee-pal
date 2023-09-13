<script lang="ts">
  import { methodOptions } from '$lib/config/autocomplete';
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import type { MyCoffeesState } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { calculateRatio } from '$lib/utils/math';
  import { faClose, faSave, faTrash } from '@fortawesome/free-solid-svg-icons';
  import {
    Autocomplete,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Form from '../ui/elements/form/Form.svelte';
  import Label from '../ui/elements/form/Label.svelte';
  import ResponsiveButton from '../ui/elements/form/ResponsiveButton.svelte';

  export let entry: Partial<ActiveJournalEntry> = {
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
  const popupMethodAutocomplete: PopupSettings = {
    event: 'focus-click',
    target: 'popupMethodAutocomplete',
    placement: 'bottom',
  };
  const popupCoffeeTypeAutocomplete: PopupSettings = {
    event: 'focus-click',
    target: 'popupCoffeeTypeAutocomplete',
    placement: 'bottom',
  };

  $: methodInputValid = !!entry.method;
  $: waterInputValid = isValidInput(entry.water);
  $: coffeeInputValid = isValidInput(entry.coffee);
  $: formValid = methodInputValid && waterInputValid && coffeeInputValid;

  $: coffeeTypeOptions = getCoffeeTypeOptions($myCoffeesStore);

  function handleSaveClick(): void {
    dispatch('save', sanitizeEntry(entry));
  }

  function handleRemoveClick(): void {
    dispatch('remove', entry.id);
  }

  function handleCancelClick(): void {
    dispatch('cancel');
  }

  function handleMethodSelect({ detail }: CustomEvent<AutocompleteOption>): void {
    entry.method = detail.label;
  }

  function handleCoffeeTypeSelect({ detail }: CustomEvent<AutocompleteOption>): void {
    entry.coffeeType = detail.label;
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function isValidInput(value?: number | null): boolean {
    return !!value && value > 0;
  }

  function sanitizeEntry(entry: Partial<ActiveJournalEntry>): ActiveJournalEntry {
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

    return sanitizedEntry as ActiveJournalEntry;
  }

  function getCoffeeTypeOptions(myCoffees: MyCoffeesState): Array<AutocompleteOption> {
    return myCoffees.activeEntries.map((entry) => ({
      label: entry.name,
      value: entry.name,
      keywords: [entry.origin, entry.trader, ...entry.aromas],
    }));
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
    <Label text="Brew method *" class="relative">
      <input
        class="input autocomplete"
        type="text"
        placeholder="Brew method, e.g. V60"
        bind:value={entry.method}
        use:popup={popupMethodAutocomplete}
        on:keydown={handleInputKeydown}
      />
      <div class="autocomplete-token" tabindex="-1" data-popup="popupMethodAutocomplete">
        <Autocomplete
          options={methodOptions}
          bind:input={entry.method}
          on:selection={handleMethodSelect}
        />
      </div>
    </Label>
    <Label text="Amount of water *">
      <input
        class="input"
        type="number"
        placeholder="Amount of water, e.g. 200"
        bind:value={entry.water}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <Label text="Amount of coffee *">
      <input
        class="input"
        type="number"
        placeholder="Amount of coffee, e.g. 12"
        bind:value={entry.coffee}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <Label text="Type of coffee" class="relative">
      <input
        class="input autocomplete"
        type="text"
        placeholder="Type of coffee, e.g. Some coffee brand"
        bind:value={entry.coffeeType}
        use:popup={popupCoffeeTypeAutocomplete}
        on:keydown={handleInputKeydown}
      />
      <div class="autocomplete-token" tabindex="-1" data-popup="popupCoffeeTypeAutocomplete">
        <Autocomplete
          options={coffeeTypeOptions}
          bind:input={entry.coffeeType}
          on:selection={handleCoffeeTypeSelect}
        />
      </div>
    </Label>
    <Label text="Water temperature">
      <input
        class="input"
        type="number"
        placeholder="Water temperature, e.g. 96"
        bind:value={entry.waterTemperature}
        on:keydown={handleInputKeydown}
      />
    </Label>
    <Label text="Grind settings">
      <input
        class="input"
        type="text"
        placeholder="Grind settings, e.g. 24 clicks"
        bind:value={entry.grindSettings}
        on:keydown={handleInputKeydown}
      />
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
    </div>
  </Form>
</div>
