<script lang="ts">
  import { calculateRatio } from '$lib/utils/math';
  import { createEventDispatcher } from 'svelte';
  import Form from '../ui/elements/Form.svelte';
  import Label from '../ui/elements/Label.svelte';
  import type { Entry } from '$lib/models/entry';
  import { v4 as uuid } from 'uuid';
  import { DateTime } from 'luxon';

  export let entry: Entry = {
    id: uuid(),
    method: '',
    water: 0,
    waterTemperature: 96,
    coffee: 0,
    coffeeType: '',
    grindSettings: '',
    description: '',
    timestamp: DateTime.now().toISO()!,
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

  function isValidInput(value: number): boolean {
    return !!value && value > 0;
  }

  function sanitizeEntry(entry: Entry): Entry {
    const sanitizedEntry: Entry = { ...entry };
    if (typeof entry.water !== 'number') {
      sanitizedEntry.water = 0;
    }

    if (typeof entry.waterTemperature !== 'number') {
      sanitizedEntry.waterTemperature = undefined;
    }

    if (typeof entry.coffee !== 'number') {
      sanitizedEntry.coffee = 0;
    }

    return sanitizedEntry;
  }
</script>

<div class="card p-4 w-full max-w-screen-md space-y-4">
  <h3 class="h3">{edit ? 'Edit' : 'Add'} Entry</h3>
  <Form>
    <Label text="Brew method">
      <input class="input" type="text" placeholder="Brew method..." bind:value={entry.method} />
    </Label>
    <Label text="Amount of water">
      <input class="input" type="number" bind:value={entry.water} />
    </Label>
    <Label text="Amount of coffee">
      <input class="input" type="number" bind:value={entry.coffee} />
    </Label>
    <Label text="Type of coffee">
      <input
        class="input"
        type="text"
        placeholder="Type of coffee..."
        bind:value={entry.coffeeType}
      />
    </Label>
    <Label text="Water temperature">
      <input class="input" type="number" bind:value={entry.waterTemperature} />
    </Label>
    <Label text="Grind settings">
      <input
        class="input"
        type="text"
        placeholder="Grind settings..."
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
    <div class="flex justify-between items-center">
      <span>Ratio: {calculateRatio(entry.coffee, entry.water) ?? 'unknown'}</span>
      <div class="flex gap-2">
        <button class="btn variant-soft" type="button" on:click={handleCancelClick}>Cancel</button>
        {#if edit}
          <button class="btn variant-soft-error" type="button" on:click={handleDeleteClick}
            >Delete</button
          >
        {/if}
        <button class="btn variant-filled-primary" disabled={!formValid} on:click={handleSaveClick}>
          Save
        </button>
      </div>
    </div>
  </Form>
</div>
