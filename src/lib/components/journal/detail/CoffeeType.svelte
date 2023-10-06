<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';
  import type { MyCoffeesState } from '$lib/models/myCoffees';
  import { myCoffeesStore } from '$lib/stores/myCoffees';
  import {
    Autocomplete,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';

  export let coffeeType: string | undefined;

  const popupCoffeeTypeAutocomplete: PopupSettings = {
    event: 'focus-click',
    target: 'popupCoffeeTypeAutocomplete',
    placement: 'bottom',
  };

  $: coffeeTypeOptions = getCoffeeTypeOptions($myCoffeesStore);

  function handleCoffeeTypeSelect({ detail }: CustomEvent<AutocompleteOption>): void {
    coffeeType = detail.label;
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function getCoffeeTypeOptions(myCoffees: MyCoffeesState): Array<AutocompleteOption> {
    return myCoffees.entries.map((entry) => ({
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
    on:keydown={handleInputKeydown}
  />
  <div class="autocomplete-token" tabindex="-1" data-popup="popupCoffeeTypeAutocomplete">
    <Autocomplete
      options={coffeeTypeOptions}
      bind:input={coffeeType}
      on:selection={handleCoffeeTypeSelect}
    />
  </div>
</Label>
