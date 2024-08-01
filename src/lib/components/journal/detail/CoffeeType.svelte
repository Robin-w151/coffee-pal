<script lang="ts">
  import InputWithButton from '$lib/components/shared/elements/form/InputWithButton.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import Portal from '$lib/components/shared/elements/Portal.svelte';
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { autocompletePopupBaseSettings } from '$lib/shared/ui/autocomplete';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
  import {
    Autocomplete,
    focusTrap,
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
    ...autocompletePopupBaseSettings,
    target: 'popupCoffeeTypeAutocomplete',
  };

  let coffeeTypeOptions: Array<AutocompleteOption<ActiveCoffeeEntry>> = [];
  let coffeeTypeInput = getCoffeeLabel(coffeeType);
  let inputElementRef: HTMLInputElement;

  $: handleCoffeeTypeChange(coffeeType);
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

  function handleCoffeeTypeChange(coffeeType?: string | ActiveCoffeeEntry): void {
    if (coffeeType) {
      const label = getCoffeeLabel(coffeeType);
      if (coffeeTypeInput !== label) {
        coffeeTypeInput = label;
      }
    } else {
      coffeeTypeInput = undefined;
    }
  }

  function handleCoffeeTypeSelect({
    detail,
  }: CustomEvent<AutocompleteOption<ActiveCoffeeEntry>>): void {
    coffeeType = detail.value;
    coffeeTypeInput = getCoffeeLabel(coffeeType);
    inputElementRef?.focus();
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

<Portal target="body">
  <div
    class="autocomplete-token"
    tabindex="-1"
    data-popup="popupCoffeeTypeAutocomplete"
    use:focusTrap={true}
  >
    <Autocomplete
      options={coffeeTypeOptions}
      filter={() => [...coffeeTypeOptions]}
      on:selection={handleCoffeeTypeSelect}
    />
  </div>
</Portal>
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
      bind:this={inputElementRef}
      bind:value={coffeeTypeInput}
      use:popup={popupCoffeeTypeAutocomplete}
      on:input={handleInputChange}
      on:keydown={handleInputKeydown}
    />
    <svelte:fragment slot="button-content">
      <Icon data={faArrowUpRightFromSquare} />
    </svelte:fragment>
  </InputWithButton>
</Label>
