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
  import { onDestroy, onMount, untrack } from 'svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    coffeeType?: string | ActiveCoffeeEntry;
  }

  let { coffeeType = $bindable() }: Props = $props();

  const filter = new BehaviorSubject<string | undefined>(undefined);
  const popupCoffeeTypeAutocomplete: PopupSettings = {
    ...autocompletePopupBaseSettings,
    target: 'popupCoffeeTypeAutocomplete',
  };

  let coffeeTypeOptions: Array<AutocompleteOption<ActiveCoffeeEntry>> = $state([]);
  let coffeeTypeInput = $state(getCoffeeLabel(coffeeType));
  let inputElementRef: HTMLInputElement | undefined = $state();
  let coffeeTypeId = $derived(typeof coffeeType === 'object' ? coffeeType.id : undefined);

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

  $effect(() => {
    handleCoffeeTypeChange(coffeeType);
  });

  function handleCoffeeTypeChange(coffeeType?: string | ActiveCoffeeEntry): void {
    untrack(() => {
      if (coffeeType) {
        const label = getCoffeeLabel(coffeeType);
        if (coffeeTypeInput !== label) {
          coffeeTypeInput = label;
        }
      } else {
        coffeeTypeInput = undefined;
      }
    });
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
      transitions={false}
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
      oninput={handleInputChange}
      onkeydown={handleInputKeydown}
    />
    {#snippet buttonContent()}
      <Icon data={faArrowUpRightFromSquare} />
    {/snippet}
  </InputWithButton>
</Label>
