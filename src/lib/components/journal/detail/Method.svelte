<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { methodOptions } from '$lib/config/brewMethods';
  import { matchesAutocompleteOption, type AutocompleteOption } from '$lib/models/autocomplete';
  import { Combobox, Portal, useListCollection } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    method?: string;
    valid?: boolean;
  }

  let { method = $bindable(), valid = $bindable(false) }: Props = $props();

  const errorMessage = 'brew method is required';

  let inputTouched = $state(false);
  let showError = $derived(inputTouched && !valid);

  let items = $derived(
    methodOptions.filter((option) => matchesAutocompleteOption(option, method ?? '')),
  );

  const collection = $derived(
    useListCollection<AutocompleteOption>({
      items,
      itemToString: (item) => item.label,
      itemToValue: (item) => item.label,
    }),
  );

  $effect(() => {
    checkValidity(method);
  });

  function handleInputValueChange(details: { inputValue: string }): void {
    method = details.inputValue;
  }

  function handleOpenChange(details: { open: boolean }): void {
    if (!details.open) {
      inputTouched = true;
    }
  }

  function checkValidity(value?: string | null): void {
    valid = !!value;
  }
</script>

<Label text="Brew method *" error={showError} {errorMessage} class="relative">
  <Combobox
    {collection}
    inputValue={method ?? ''}
    allowCustomValue
    openOnClick
    onInputValueChange={handleInputValueChange}
    onOpenChange={handleOpenChange}
  >
    <Combobox.Control>
      <Combobox.Input
        class="input {showError ? 'input-error' : ''}"
        placeholder="Brew method, e.g. V60"
        onblur={() => (inputTouched = true)}
      />
    </Combobox.Control>
    <Portal>
      <Combobox.Positioner>
        <Combobox.Content class="autocomplete-token">
          {#each items as item (item.label)}
            <Combobox.Item {item}>
              <Combobox.ItemText>{item.label}</Combobox.ItemText>
              <Combobox.ItemIndicator />
            </Combobox.Item>
          {/each}
        </Combobox.Content>
      </Combobox.Positioner>
    </Portal>
  </Combobox>
</Label>
