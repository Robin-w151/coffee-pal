<script lang="ts">
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faClose } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Actions from '../ui/elements/form/Actions.svelte';
  import Form from '../ui/elements/form/Form.svelte';
  import Aromas from './detail/Aromas.svelte';
  import Description from './detail/Description.svelte';
  import Name from './detail/Name.svelte';
  import Origin from './detail/Origin.svelte';
  import Trader from './detail/Trader.svelte';
  import Variety from './detail/Variety.svelte';

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

  let nameInputValid: boolean;

  $: formValid = nameInputValid;

  function handleSave(): void {
    dispatch('save', sanitizeEntry(entry));
  }

  function handleRemove(): void {
    dispatch('remove', entry.id);
  }

  function handleCancelClick(): void {
    dispatch('cancel');
  }

  function sanitizeEntry(entry: Partial<ActiveCoffeeEntry>): ActiveCoffeeEntry {
    const sanitizedEntry = { ...entry };

    if (!sanitizedEntry.origin) {
      sanitizedEntry.origin = undefined;
    }

    if (!sanitizedEntry.variety) {
      sanitizedEntry.variety = undefined;
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
    <h3 class="h3">Coffee Entry</h3>
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
    <Name bind:name={entry.name} bind:valid={nameInputValid} />
    <Origin bind:origin={entry.origin} />
    <Variety bind:variety={entry.variety} />
    <Trader bind:trader={entry.trader} />
    <Aromas bind:aromas={entry.aromas} />
    <Description bind:description={entry.description} />
    <div class="flex justify-end items-center gap-2">
      <Actions {edit} {formValid} on:save={handleSave} on:remove={handleRemove} />
    </div>
  </Form>
</div>
