<script lang="ts">
  import InputWithButton from '$lib/components/shared/elements/form/InputWithButton.svelte';
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import type { AutocompleteOption } from '$lib/models/autocomplete';
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
  import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';
  import { BehaviorSubject, debounceTime, map, switchMap, tap } from 'rxjs';
  import { onDestroy, onMount, untrack } from 'svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    coffeeType?: string | ActiveCoffeeEntry;
  }

  let { coffeeType = $bindable() }: Props = $props();

  const filter = new BehaviorSubject<string | undefined>(undefined);

  let coffeeTypeOptions: Array<AutocompleteOption<ActiveCoffeeEntry>> = $state([]);
  let coffeeTypeInput = $state(getCoffeeLabel(coffeeType));
  let coffeeTypeId = $derived(typeof coffeeType === 'object' ? coffeeType.id : undefined);

  const collection = $derived(
    useListCollection<AutocompleteOption<ActiveCoffeeEntry>>({
      items: coffeeTypeOptions,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.value.id,
    }),
  );

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

  /**
   * Picking a suggestion stores the whole coffee entry, while free text is kept
   * as a plain string.
   */
  function handleValueChange(details: {
    items: Array<AutocompleteOption<ActiveCoffeeEntry>>;
  }): void {
    const selected = details.items[0];
    if (selected) {
      coffeeType = selected.value;
      coffeeTypeInput = selected.label;
    }
  }

  function handleInputValueChange(details: { inputValue: string; reason?: string }): void {
    coffeeTypeInput = details.inputValue;

    // Only typing produces a free-text value. Selecting a suggestion, clicking
    // away and programmatic updates all rewrite the input too, and must not
    // downgrade the stored entry back to a plain string.
    if (details.reason !== 'input-change') {
      return;
    }

    coffeeType = details.inputValue;
    filter.next(details.inputValue);
  }

  function getCoffeeTypeOptions(
    entries: Array<ActiveCoffeeEntry>,
  ): Array<AutocompleteOption<ActiveCoffeeEntry>> {
    return entries.map((entry) => ({
      label: getCoffeeLabel(entry)!,
      value: entry,
    }));
  }
</script>

<Label text="Type of coffee" class="relative">
  <InputWithButton
    title="Open coffee entry"
    visible={!!coffeeTypeId}
    href="/my-coffees/{coffeeTypeId}"
  >
    <Combobox
      {collection}
      inputValue={coffeeTypeInput ?? ''}
      allowCustomValue
      openOnClick
      onInputValueChange={handleInputValueChange}
      onValueChange={handleValueChange}
    >
      <Combobox.Control>
        <Combobox.Input class="input" placeholder="Type of coffee, e.g. Some coffee brand" />
      </Combobox.Control>
      <Portal>
        <Combobox.Positioner>
          <Combobox.Content class="autocomplete-token" data-testid="coffee-type-suggestions">
            {#each coffeeTypeOptions as item (item.value.id)}
              <Combobox.Item {item}>
                <Combobox.ItemText>{item.label}</Combobox.ItemText>
                <Combobox.ItemIndicator />
              </Combobox.Item>
            {/each}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox>
    {#snippet buttonContent()}
      <Icon data={faArrowUpRightFromSquare} />
    {/snippet}
  </InputWithButton>
</Label>
