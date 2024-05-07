<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { faLink } from '@fortawesome/free-solid-svg-icons';
  import {
    Autocomplete,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';
  import { BehaviorSubject, debounceTime, map, switchMap, tap } from 'rxjs';
  import { onDestroy, onMount } from 'svelte';
  import { Icon } from 'svelte-awesome';

  export let coffeeType: string | ActiveCoffeeEntry | undefined;

  const filter = new BehaviorSubject<string | undefined>(undefined);
  const popupCoffeeTypeAutocomplete: PopupSettings = {
    event: 'focus-click',
    target: 'popupCoffeeTypeAutocomplete',
    placement: 'bottom',
  };

  let coffeeTypeOptions: Array<AutocompleteOption<ActiveCoffeeEntry>> = [];

  $: coffeeTypeInput = coffeeType
    ? typeof coffeeType === 'string'
      ? coffeeType
      : [coffeeType.name, coffeeType.roaster].filter((s) => !!s).join('/')
    : undefined;
  $: coffeeTypeId = typeof coffeeType === 'object' ? coffeeType.id : undefined;

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

  function handleCoffeeTypeSelect({
    detail,
  }: CustomEvent<AutocompleteOption<ActiveCoffeeEntry>>): void {
    coffeeType = detail.value;
  }

  function handleInputChange(): void {
    coffeeType = coffeeTypeInput;
    filter.next(coffeeTypeInput);
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function getCoffeeTypeOptions(
    entries: Array<ActiveCoffeeEntry>,
  ): Array<AutocompleteOption<ActiveCoffeeEntry>> {
    return entries.map((entry) => {
      const option = [entry.name, entry.roaster].filter((s) => !!s).join('/');
      return {
        label: option,
        value: entry,
        keywords: `${entry.origin},${entry.process},${entry.variety},${entry.roaster},${entry.trader},${entry.aromas.join(',')}`,
      };
    });
  }
</script>

<Label text="Type of coffee" class="relative">
  <div class="input-group input-group-divider grid-cols-[1fr_auto] input autocomplete">
    <input
      type="text"
      placeholder="Type of coffee, e.g. Some coffee brand"
      bind:value={coffeeTypeInput}
      use:popup={popupCoffeeTypeAutocomplete}
      on:input={handleInputChange}
      on:keydown={handleInputKeydown}
    />
    {#if coffeeTypeId}
      <a href="/my-coffees/{coffeeTypeId}">
        <Icon data={faLink} />
      </a>
    {/if}
  </div>
  <div class="autocomplete-token !left-0" tabindex="-1" data-popup="popupCoffeeTypeAutocomplete">
    <Autocomplete
      options={coffeeTypeOptions}
      filter={() => coffeeTypeOptions}
      on:selection={handleCoffeeTypeSelect}
    />
  </div>
</Label>
