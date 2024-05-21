<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import {
    pauseScheduledSync,
    resumeScheduledSync,
    scheduleSync,
  } from '$lib/services/scheduler/syncScheduler';
  import { isEqualCoffeeEntry } from '$lib/shared/compare';
  import { ModalHelper } from '$lib/shared/ui/modal';
  import { ToastHelper } from '$lib/shared/ui/toast';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { syncStateEvents } from '$lib/stores/syncState';
  import { faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { Subject, takeUntil, tap } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { v4 as uuid } from 'uuid';
  import Actions from '../shared/elements/form/Actions.svelte';
  import Form from '../shared/elements/form/Form.svelte';
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageHeader from '../shared/elements/page/PageHeader.svelte';
  import Aromas from './detail/Aromas.svelte';
  import Description from './detail/Description.svelte';
  import Name from './detail/Name.svelte';
  import Origin from './detail/Origin.svelte';
  import Process from './detail/Process.svelte';
  import Rating from './detail/Rating.svelte';
  import Roaster from './detail/Roaster.svelte';
  import Trader from './detail/Trader.svelte';
  import Variety from './detail/Variety.svelte';

  export let id: string | undefined = undefined;

  const modalHelper = new ModalHelper(getModalStore());
  const toastStore = getToastStore();
  const toastHelper = new ToastHelper(toastStore);
  const destroy = new Subject<void>();

  let entry: Partial<ActiveCoffeeEntry> = {
    name: '',
    origin: undefined,
    process: undefined,
    variety: undefined,
    roaster: undefined,
    trader: undefined,
    rating: 0,
    aromas: [],
    description: undefined,
    createdAt: '',
    updatedAt: '',
  };
  let originalEntry: Partial<ActiveCoffeeEntry> = structuredClone(entry);
  let unknown = false;
  let isLoading = true;
  let shouldGoBack = true;

  let nameInputValid: boolean;

  $: entryTitle = getTitle(unknown, entry);
  $: formValid = nameInputValid;
  $: hasChanged = !isEqualCoffeeEntry(entry, originalEntry);

  onMount(async () => {
    pauseScheduledSync();

    syncStateEvents
      .pipe(
        tap(async ({ isSynchronizing }) => {
          if (!isSynchronizing && id && entry) {
            const loadedEntry = await myCoffeesStore.loadOne(id);
            if (loadedEntry && !isEqualCoffeeEntry(entry, loadedEntry)) {
              toastHelper.triggerInfo(
                'This entry was updated in the background. Do you want to reload now?',
                {
                  action: {
                    label: 'Reload now',
                    response: async () => {
                      entry = loadedEntry;
                      originalEntry = structuredClone(loadedEntry);
                    },
                  },
                  autohide: false,
                },
              );
            }
          }
        }),
        takeUntil(destroy),
      )
      .subscribe();

    if (id) {
      const loadedEntry = await myCoffeesStore.loadOne(id);
      if (loadedEntry) {
        entry = loadedEntry;
        originalEntry = structuredClone(loadedEntry);
      } else {
        unknown = true;
      }
    }
    isLoading = false;
  });

  onDestroy(() => {
    resumeScheduledSync();
    destroy.next();
    destroy.complete();
    toastStore.clear();
  });

  beforeNavigate(async ({ cancel, to }) => {
    if (hasChanged && !unknown && !isLoading) {
      cancel();
      const confirmed = await modalHelper.triggerConfirm(
        'You have unsaved changes',
        'Are you sure you want to leave?',
      );
      if (confirmed && to) {
        hasChanged = false;

        if (shouldGoBack) {
          history.back();
        } else {
          goto(to.url.pathname);
        }
      }
    }
  });

  function handleSave(): void {
    const sanitizedEntry = sanitizeEntry(entry);
    if (entry.id) {
      myCoffeesStore.update(sanitizedEntry);
    } else {
      myCoffeesStore.add({ ...sanitizedEntry, id: uuid() });
    }
    hasChanged = false;
    scheduleSync();
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
    hasChanged = false;
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

    if (!sanitizedEntry.process) {
      sanitizedEntry.process = undefined;
    }

    if (!sanitizedEntry.variety) {
      sanitizedEntry.variety = undefined;
    }

    if (!sanitizedEntry.roaster) {
      sanitizedEntry.roaster = undefined;
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
    shouldGoBack = true;
    history.back();
  }

  function getTitle(unknown: boolean, entry?: Partial<ActiveCoffeeEntry>): string {
    if (unknown) {
      return 'Unknown';
    } else if (entry?.id) {
      return getCoffeeLabel(entry) || 'Unknown';
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
    <div class="@container">
      <Form class="@3xl:grid @3xl:grid-cols-2">
        <Name bind:name={entry.name} bind:valid={nameInputValid} />
        <Origin bind:origin={entry.origin} />
        <Process bind:process={entry.process} />
        <Variety bind:variety={entry.variety} />
        <Roaster bind:roaster={entry.roaster} />
        <Trader bind:trader={entry.trader} />
        <Rating bind:rating={entry.rating} />
        <div class="col-span-full">
          <Aromas bind:aromas={entry.aromas} />
        </div>
        <div class="col-span-full">
          <Description bind:description={entry.description} />
        </div>
        <div class="flex justify-end items-center gap-2 col-span-full">
          <Actions edit={!!id} {formValid} on:save={handleSave} on:remove={handleRemove} />
        </div>
      </Form>
    </div>
  {/if}
</PageCard>
