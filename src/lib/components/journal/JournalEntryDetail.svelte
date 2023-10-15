<script lang="ts">
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { faClose } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Actions from '../ui/elements/form/Actions.svelte';
  import Form from '../ui/elements/form/Form.svelte';
  import Coffee from './detail/Coffee.svelte';
  import CoffeeType from './detail/CoffeeType.svelte';
  import Description from './detail/Description.svelte';
  import GrindSettings from './detail/GrindSettings.svelte';
  import Method from './detail/Method.svelte';
  import Ratio from './detail/Ratio.svelte';
  import Water from './detail/Water.svelte';
  import WaterTemperature from './detail/WaterTemperature.svelte';

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

  let methodInputValid: boolean;
  let waterInputValid: boolean;
  let coffeeInputValid: boolean;
  let waterTemperatureValid: boolean;

  $: formValid = methodInputValid && waterInputValid && coffeeInputValid;

  function handleSave(): void {
    dispatch('save', sanitizeEntry(entry));
  }

  function handleCopy(): void {
    dispatch('copy', sanitizeEntry(entry));
  }

  function handleRemove(): void {
    dispatch('remove', entry.id);
  }

  function handleCancelClick(): void {
    dispatch('cancel');
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
    <Method bind:method={entry.method} bind:valid={methodInputValid} />
    <CoffeeType bind:coffeeType={entry.coffeeType} />
    <Water bind:water={entry.water} bind:valid={waterInputValid} />
    <Coffee bind:coffee={entry.coffee} bind:valid={coffeeInputValid} />
    <WaterTemperature
      bind:waterTemperature={entry.waterTemperature}
      bind:valid={waterTemperatureValid}
    />
    <GrindSettings bind:grindSettings={entry.grindSettings} />
    <Description bind:description={entry.description} />
    <div class="flex justify-between items-center gap-4">
      <Ratio coffee={entry.coffee} water={entry.water} />
      <Actions
        {edit}
        {formValid}
        allowCopy
        on:save={handleSave}
        on:copy={handleCopy}
        on:remove={handleRemove}
      />
    </div>
  </Form>
</div>
