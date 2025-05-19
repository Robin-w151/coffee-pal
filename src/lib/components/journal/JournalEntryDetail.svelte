<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { type ActiveJournalEntry } from '$lib/models/journal';
  import { getCoffeeLabel } from '$lib/models/myCoffees';
  import { pauseScheduledSync, resumeScheduledSync, scheduleSync } from '$lib/services/sync/sync';
  import { isEqualJournalEntry } from '$lib/shared/compare';
  import { ModalHelper } from '$lib/shared/ui/modal';
  import { ToastHelper } from '$lib/shared/ui/toast';
  import { journalStore } from '$lib/stores/journal';
  import { syncStateEvents } from '$lib/stores/syncState.svelte';
  import { faCalculator, faFaceSadCry } from '@fortawesome/free-solid-svg-icons';
  import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
  import { Subject, takeUntil, tap } from 'rxjs';
  import { onDestroy, onMount, untrack } from 'svelte';
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
  import ResponsiveButton from '../shared/elements/form/ResponsiveButton.svelte';

  interface Props {
    id?: string | undefined;
  }

  let { id = undefined }: Props = $props();

  const modalHelper = new ModalHelper(getModalStore());
  const toastStore = getToastStore();
  const toastHelper = new ToastHelper(toastStore);
  const destroy = new Subject<void>();

  let entry: Partial<ActiveJournalEntry> = $state({
    method: '',
    water: undefined,
    waterTemperature: undefined,
    coffee: undefined,
    coffeeType: undefined,
    grindSettings: undefined,
    rating: 0,
    description: undefined,
    createdAt: '',
    updatedAt: '',
  });
  let originalEntry: Partial<ActiveJournalEntry> = $state(
    structuredClone(untrack(() => $state.snapshot(entry))),
  );
  let unknown = $state(false);
  let isLoading = $state(true);
  let hasChanged = $derived(!isEqualJournalEntry(entry, originalEntry));
  let shouldGoBack = false;
  let updateInfoToast: string | undefined;

  let methodInputValid = $state(true);
  let waterInputValid = $state(true);
  let coffeeInputValid = $state(true);
  let waterTemperatureValid = $state(true);
  let formValid = $derived(methodInputValid && waterInputValid && coffeeInputValid);

  let pageHeader = $state<PageHeader | undefined>(undefined);
  let entryTitle = $derived(getTitle(unknown, entry));

  onMount(async () => {
    pauseScheduledSync();

    syncStateEvents
      .pipe(
        tap(async ({ isSynchronizing }) => {
          if (!isSynchronizing && id && entry) {
            const loadedEntry = await journalStore.loadOne(id);
            if (loadedEntry && !isEqualJournalEntry(entry, loadedEntry)) {
              updateInfoToast = toastHelper.triggerInfo(
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
      const loadedEntry = await journalStore.loadOne(id);
      if (loadedEntry) {
        entry = loadedEntry;
        originalEntry = structuredClone(loadedEntry);
      } else {
        unknown = true;
      }
    }
    isLoading = false;

    pageHeader?.focusBackButton();
  });

  onDestroy(() => {
    resumeScheduledSync();
    destroy.next();
    destroy.complete();

    if (updateInfoToast) {
      toastStore.close(updateInfoToast);
    }
  });

  beforeNavigate(async ({ cancel, to }) => {
    if (hasChanged && !unknown && !isLoading) {
      cancel();
      const confirmed = await askUnsavedChanges();
      if (confirmed && to) {
        hasChanged = false;

        if (shouldGoBack) {
          history.back();
        } else {
          goto(`${to.url.pathname}${to.url.search}`);
        }
      } else {
        shouldGoBack = false;
      }
    }
  });

  function handleSave(): void {
    const sanitizedEntry = sanitizeEntry($state.snapshot(entry));
    originalEntry = structuredClone(sanitizedEntry);
    scheduleSync();

    if (entry.id) {
      journalStore.update(sanitizedEntry);
    } else {
      const newId = uuid();
      journalStore.add({ ...sanitizedEntry, id: newId });
      hasChanged = false;
      goToEntry(newId);
    }
  }

  async function handleCopy(): Promise<void> {
    const sanitizedEntry = sanitizeEntry($state.snapshot(entry));
    const newId = uuid();
    journalStore.add({ ...sanitizedEntry, id: newId });
    hasChanged = false;
    scheduleSync();
    goToEntry(newId);
  }

  function handleRemove(): void {
    if (id) {
      const entryId = id;
      toastHelper.triggerInfo('Did you click to fast?', {
        timeout: 15000,
        action: {
          label: 'Undo',
          response: () => {
            journalStore.undo(entryId);
          },
        },
        callback: (response) => {
          if (response.status === 'closed') {
            scheduleSync();
          }
        },
      });

      journalStore.remove(id);
    }
    hasChanged = false;
    goBack();
  }

  function handleBack(): void {
    goBack();
  }

  function handleOpenInCalculator(): void {
    if (entry.water === undefined || entry.coffee === undefined) {
      return;
    }

    const recipe = {
      water: `${entry.water}`,
      coffee: `${entry.coffee}`,
    };

    goto(`/calculator?${new URLSearchParams(recipe).toString()}`);
  }

  function handleCoffeeChange(coffee: number | undefined): void {
    entry.coffee = coffee;
  }

  function handleWaterChange(water: number | undefined): void {
    entry.water = water;
  }

  function handleWaterTemperatureChange(waterTemperature: number | undefined): void {
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
    shouldGoBack = true;
    history.back();
  }

  function goToEntry(id: string): void {
    goto(`/journal/${id}`, { replaceState: true });
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

  function askUnsavedChanges(): Promise<boolean> {
    return modalHelper.triggerConfirm(
      'You have unsaved changes',
      'Are you sure you want to leave?',
    );
  }
</script>

<PageHeader title={entryTitle} {isLoading} showBack bind:this={pageHeader} onBack={handleBack} />
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
        <Water water={entry.water} bind:valid={waterInputValid} onChange={handleWaterChange} />
        <Coffee coffee={entry.coffee} bind:valid={coffeeInputValid} onChange={handleCoffeeChange} />
        <WaterTemperature
          waterTemperature={entry.waterTemperature}
          bind:valid={waterTemperatureValid}
          onChange={handleWaterTemperatureChange}
        />
        <GrindSettings bind:grindSettings={entry.grindSettings} />
        <Rating bind:rating={entry.rating} />
        <div class="col-span-full">
          <Description bind:description={entry.description} />
        </div>
        <div class="flex justify-between items-center gap-4 col-span-full">
          <Ratio coffee={entry.coffee} water={entry.water} />
          <Actions
            edit={!!id}
            {formValid}
            hasChanged={id ? hasChanged : undefined}
            allowCopy
            onSave={handleSave}
            onCopy={handleCopy}
            onRemove={handleRemove}
          >
            {#snippet beforeContent()}
              {#if id}
                <ResponsiveButton
                  type="button"
                  label="Open in calculator"
                  variant="variant-ghost-tertiary"
                  disabled={!formValid}
                  onclick={handleOpenInCalculator}
                >
                  {#snippet iconContent()}
                    <Icon data={faCalculator} />
                  {/snippet}
                </ResponsiveButton>
              {/if}
            {/snippet}
          </Actions>
        </div>
      </Form>
    </div>
  {/if}
</PageCard>
