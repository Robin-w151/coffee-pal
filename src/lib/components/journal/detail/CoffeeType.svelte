<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import Combobox, { type ComboboxOption } from '$lib/components/shared/ui/Combobox.svelte';
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
  import { BehaviorSubject, debounceTime, map, switchMap, tap } from 'rxjs';
  import { onDestroy, onMount, untrack } from 'svelte';

  interface Props {
    coffeeType?: string | ActiveCoffeeEntry;
  }

  let { coffeeType = $bindable() }: Props = $props();

  const filter = new BehaviorSubject<string | undefined>(undefined);

  let coffeeTypeOptions: Array<ComboboxOption<ActiveCoffeeEntry>> = $state([]);
  let coffeeTypeInput = $state(getCoffeeLabel(coffeeType));
  const coffeeTypeId = $derived(typeof coffeeType === 'object' ? coffeeType.id : undefined);

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

  function handleCoffeeTypeSelect(option: ComboboxOption<ActiveCoffeeEntry>): void {
    coffeeType = option.value;
    coffeeTypeInput = getCoffeeLabel(coffeeType);
  }

  function handleInputChange(): void {
    coffeeType = coffeeTypeInput;
    filter.next(coffeeTypeInput);
  }

  function getCoffeeTypeOptions(
    entries: Array<ActiveCoffeeEntry>,
  ): Array<ComboboxOption<ActiveCoffeeEntry>> {
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
  <Combobox
    options={coffeeTypeOptions}
    filter="none"
    placeholder="Type of coffee, e.g. Some coffee brand"
    trailLink={{
      title: 'Open coffee entry',
      href: `/my-coffees/${coffeeTypeId}`,
      visible: !!coffeeTypeId,
      icon: faArrowUpRightFromSquare,
    }}
    bind:value={coffeeTypeInput}
    onSelect={handleCoffeeTypeSelect}
    onInputChange={handleInputChange}
  />
</Label>
