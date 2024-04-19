<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { ToastHelper } from '$lib/utils/ui/toast';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Actions from '../ui/elements/form/Actions.svelte';
  import Form from '../ui/elements/form/Form.svelte';
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageHeader from '../ui/elements/page/PageHeader.svelte';
  import Aromas from './detail/Aromas.svelte';
  import Description from './detail/Description.svelte';
  import Name from './detail/Name.svelte';
  import Origin from './detail/Origin.svelte';
  import Process from './detail/Process.svelte';
  import Trader from './detail/Trader.svelte';
  import Variety from './detail/Variety.svelte';
  import Rating from './detail/Rating.svelte';

  export let id: string | undefined = undefined;

  const toastHelper = new ToastHelper(getToastStore());

  let entry: Partial<ActiveCoffeeEntry> = {
    name: '',
    origin: undefined,
    trader: undefined,
    aromas: [],
    description: '',
    createdAt: '',
    updatedAt: '',
  };
  let unknown = false;
  let isLoading = true;

  let nameInputValid: boolean;

  $: entryTitle = getTitle(unknown, entry);
  $: formValid = nameInputValid;

  onMount(async () => {
    if (id) {
      const loadedEntry = await myCoffeesStore.loadOne(id);
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
      myCoffeesStore.update(sanitizedEntry);
    } else {
      myCoffeesStore.add({ ...sanitizedEntry, id: uuid() });
    }
    goBack();
  }

  function handleRemove(): void {
    if (id) {
      const entryId = id;
      toastHelper.triggerInfo('Did you click to fast?', {
        timeout: 15000,
        action: {
          label: 'Undo',
          response: () => myCoffeesStore.undo(entryId),
        },
      });

      myCoffeesStore.remove(id);
    }
    goBack();
  }

  function handleBack(): void {
    goBack();
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

    if (!sanitizedEntry.rating) {
      sanitizedEntry.rating = undefined;
    }

    if (!sanitizedEntry.description) {
      sanitizedEntry.description = undefined;
    }

    return sanitizedEntry as ActiveCoffeeEntry;
  }

  function goBack(): void {
    goto('/my-coffees');
  }

  function getTitle(unknown: boolean, entry?: Partial<ActiveCoffeeEntry>): string {
    if (unknown) {
      return 'Unknown';
    } else if (entry?.id) {
      return entry.name || 'Unknown';
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
      <span>Could not find any entry! Go back to the <a href="/my-coffees">overview</a></span>
    </p>
  {:else}
    <Form>
      <Name bind:name={entry.name} bind:valid={nameInputValid} />
      <Origin bind:origin={entry.origin} />
      <Process bind:process={entry.process} />
      <Variety bind:variety={entry.variety} />
      <Trader bind:trader={entry.trader} />
      <Rating bind:rating={entry.rating} />
      <Aromas bind:aromas={entry.aromas} />
      <Description bind:description={entry.description} />
      <div class="flex justify-end items-center gap-2 col-span-2">
        <Actions edit={!!id} {formValid} on:save={handleSave} on:remove={handleRemove} />
      </div>
    </Form>
  {/if}
</PageCard>
