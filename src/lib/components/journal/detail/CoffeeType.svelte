<script lang="ts">
  import InputWithButton from '$lib/components/shared/elements/form/InputWithButton.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
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

  $: coffeeTypeInput = getCoffeeLabel(coffeeType);
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
      const option = getCoffeeLabel(entry)!;
      return {
        label: option,
        value: entry,
      };
    });
  }
</script>

<Label text="Type of coffee" class="relative">
  <InputWithButton
    title="Open coffee entry"
    visible={!!coffeeTypeId}
    href="/my-coffees/{coffeeTypeId}"
  >
    <input
      class="input autocomplete"
      type="text"
      placeholder="Type of coffee, e.g. Some coffee brand"
      bind:value={coffeeTypeInput}
      use:popup={popupCoffeeTypeAutocomplete}
      on:input={handleInputChange}
      on:keydown={handleInputKeydown}
    />
    <svelte:fragment slot="button-content">
      <Icon data={faArrowUpRightFromSquare} />
    </svelte:fragment>
    <div class="autocomplete-token" tabindex="-1" data-popup="popupCoffeeTypeAutocomplete">
      <Autocomplete
        options={coffeeTypeOptions}
        filter={() => [...coffeeTypeOptions]}
        on:selection={handleCoffeeTypeSelect}
      />
    </div>
  </InputWithButton>
</Label>
