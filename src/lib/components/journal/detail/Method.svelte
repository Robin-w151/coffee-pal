<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import Combobox, { type ComboboxOption } from '$lib/components/ui/Combobox.svelte';
  import { methodOptions } from '$lib/config/brewMethods';

  interface Props {
    method?: string;
    valid?: boolean;
  }

  let { method = $bindable(), valid = $bindable(false) }: Props = $props();

  const errorMessage = 'brew method is required';

  let inputTouched = $state(false);
  let autocompleteTouched = $state(false);
  let showError = $derived(inputTouched && autocompleteTouched && !valid);

  $effect(() => {
    checkValidity(method);
  });

  function handleMethodSelect(option: ComboboxOption<string>): void {
    method = option.label;
  }

  function handleAutocompleteOpenChange(open: boolean): void {
    if (!open) {
      autocompleteTouched = true;
    }
  }

  function handleInputBlur(): void {
    inputTouched = true;
  }

  function checkValidity(value?: string | null): void {
    valid = !!value;
  }
</script>

<Label text="Brew method *" error={showError} {errorMessage} class="relative">
  <Combobox
    options={methodOptions}
    placeholder="Brew method, e.g. V60"
    invalid={showError}
    bind:inputValue={method}
    onSelect={handleMethodSelect}
    onBlur={handleInputBlur}
    onOpenChange={handleAutocompleteOpenChange}
  />
</Label>
