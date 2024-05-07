<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ActiveJournalEntry } from '$lib/models/journal';
  import { journalStore } from '$lib/stores/journal';
  import { ToastHelper } from '$lib/shared/ui/toast';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Actions from '../shared/elements/form/Actions.svelte';
  import Form from '../shared/elements/form/Form.svelte';
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageHeader from '../shared/elements/page/PageHeader.svelte';
  import Coffee from './detail/Coffee.svelte';
  import CoffeeType from './detail/CoffeeType.svelte';
  import Description from './detail/Description.svelte';
  import GrindSettings from './detail/GrindSettings.svelte';
  import Method from './detail/Method.svelte';
  import Rating from './detail/Rating.svelte';
  import Ratio from './detail/Ratio.svelte';
  import Water from './detail/Water.svelte';
  import WaterTemperature from './detail/WaterTemperature.svelte';
  import { getCoffeeLabel } from '$lib/models/myCoffees';

  export let id: string | undefined = undefined;

  const toastHelper = new ToastHelper(getToastStore());

  let entry: Partial<ActiveJournalEntry> = {
    method: '',
    water: undefined,
    waterTemperature: undefined,
    coffee: undefined,
    coffeeType: '',
    grindSettings: '',
    rating: undefined,
    description: '',
    createdAt: '',
    updatedAt: '',
  };
  let unknown = false;
  let isLoading = true;

  let methodInputValid: boolean;
  let waterInputValid: boolean;
  let coffeeInputValid: boolean;
  let waterTemperatureValid: boolean;

  $: entryTitle = getTitle(unknown, entry);
  $: formValid = methodInputValid && waterInputValid && coffeeInputValid;

  onMount(async () => {
    if (id) {
      const loadedEntry = await journalStore.loadOne(id);
      if (loadedEntry) {
        entry = loadedEntry;
      } else {
        unknown = true;
      }
    }
    isLoading = false;
  });

  function handleSave(): void {
    const sanitizedEntry = sanitizeEntry(entry);
    if (entry.id) {
      journalStore.update(sanitizedEntry);
    } else {
      journalStore.add({ ...sanitizedEntry, id: uuid() });
    }
    goBack();
  }

  function handleCopy(): void {
    const sanitizedEntry = sanitizeEntry(entry);
    journalStore.add({ ...sanitizedEntry, id: uuid() });
    goBack();
  }

  function handleRemove(): void {
    if (id) {
      const entryId = id;
      toastHelper.triggerInfo('Did you click to fast?', {
        timeout: 15000,
        action: {
          label: 'Undo',
          response: () => journalStore.undo(entryId),
        },
      });

      journalStore.remove(id);
    }
    goBack();
  }

  function handleBack(): void {
    goBack();
  }

  function handleCoffeeChange({ detail: coffee }: CustomEvent<number | undefined>): void {
    entry.coffee = coffee;
  }

  function handleWaterChange({ detail: water }: CustomEvent<number | undefined>): void {
    entry.water = water;
  }

  function handleWaterTemperatureChange({
    detail: waterTemperature,
  }: CustomEvent<number | undefined>): void {
    entry.waterTemperature = waterTemperature;
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

    if (!entry.rating) {
      sanitizedEntry.rating = undefined;
    }

    return sanitizedEntry as ActiveJournalEntry;
  }

  function goBack(): void {
    goto('/');
  }

  function getTitle(unknown: boolean, entry?: Partial<ActiveJournalEntry>): string {
    if (unknown) {
      return 'Unknown';
    } else if (entry?.id) {
      const coffeeType = getCoffeeLabel(entry.coffeeType);
      return `${entry.method || 'Unknown'} - ${coffeeType || 'Unknown'}`;
    } else {
      return 'New Entry';
    }
  }
</script>

<PageHeader title={entryTitle} {isLoading} showBack on:back={handleBack} />
<PageCard>
  {#if unknown}
    <p class="flex justify-center items-center gap-4">
      <span class="flex items-center">
        <Icon data={faFaceSadCry} />
      </span>
      <span>Could not find any entry! Go back to the <a href="/">overview</a></span>
    </p>
  {:else}
    <div class="@container">
      <Form class="@3xl:grid @3xl:grid-cols-2">
        <Method bind:method={entry.method} bind:valid={methodInputValid} />
        <CoffeeType bind:coffeeType={entry.coffeeType} />
        <Water water={entry.water} bind:valid={waterInputValid} on:change={handleWaterChange} />
        <Coffee
          coffee={entry.coffee}
          bind:valid={coffeeInputValid}
          on:change={handleCoffeeChange}
        />
        <WaterTemperature
          waterTemperature={entry.waterTemperature}
          bind:valid={waterTemperatureValid}
          on:change={handleWaterTemperatureChange}
        />
        <GrindSettings bind:grindSettings={entry.grindSettings} />
        <Rating bind:rating={entry.rating} />
        <div class="col-span-2">
          <Description bind:description={entry.description} />
        </div>
        <div class="flex justify-between items-center gap-4 col-span-2">
          <Ratio coffee={entry.coffee} water={entry.water} />
          <Actions
            edit={!!id}
            {formValid}
            allowCopy
            on:save={handleSave}
            on:copy={handleCopy}
            on:remove={handleRemove}
          />
        </div>
      </Form>
    </div>
  {/if}
</PageCard>
