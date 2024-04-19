<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import {
    Autocomplete,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';
  import { BehaviorSubject, debounceTime, map, switchMap, tap } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';

  export let coffeeType: string | undefined;

  const filter = new BehaviorSubject<string | undefined>(undefined);
  const popupCoffeeTypeAutocomplete: PopupSettings = {
    event: 'focus-click',
    target: 'popupCoffeeTypeAutocomplete',
    placement: 'bottom',
  };

  let coffeeTypeOptions: Array<AutocompleteOption> = [];

  onMount(() => {
    filter
      .pipe(
        debounceTime(250),
        switchMap((filter) => myCoffeesStore.quickSearch(filter)),
        map(getCoffeeTypeOptions),
        tap((options) => {
          coffeeTypeOptions = options;
        }),
      )
      .subscribe();
  });

  onDestroy(() => {
    filter.complete();
  });

  function handleCoffeeTypeSelect({ detail }: CustomEvent<AutocompleteOption>): void {
    coffeeType = detail.label;
  }

  function handleInputChange(): void {
    filter.next(coffeeType);
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function getCoffeeTypeOptions(entries: Array<ActiveCoffeeEntry>): Array<AutocompleteOption> {
    return entries.map((entry) => ({
      label: entry.name,
      value: entry.name,
      keywords: `${entry.origin},${entry.trader},${entry.aromas.join(',')}`,
    }));
  }
</script>

<Label text="Type of coffee" class="relative">
  <input
    class="input autocomplete"
    type="text"
    placeholder="Type of coffee, e.g. Some coffee brand"
    bind:value={coffeeType}
    use:popup={popupCoffeeTypeAutocomplete}
    on:input={handleInputChange}
    on:keydown={handleInputKeydown}
  />
  <div class="autocomplete-token" tabindex="-1" data-popup="popupCoffeeTypeAutocomplete">
    <Autocomplete
      options={coffeeTypeOptions}
      filter={() => coffeeTypeOptions}
      bind:input={coffeeType}
      on:selection={handleCoffeeTypeSelect}
    />
  </div>
</Label>
