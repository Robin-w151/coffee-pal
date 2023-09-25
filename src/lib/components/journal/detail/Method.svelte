<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';
  import { methodOptions } from '$lib/config/autocomplete';
  import {
    Autocomplete,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';

  export let method: string | undefined;
  export let valid = false;

  const errorMessage = 'brew method is required';
  const popupMethodAutocomplete: PopupSettings = {
    event: 'focus-click',
    target: 'popupMethodAutocomplete',
    placement: 'bottom',
    state: ({ state }) => {
      if (!state) {
        autocompleteTouched = true;
      }
    },
  };

  let inputTouched = false;
  let autocompleteTouched = false;

  $: checkValidity(method);
  $: showError = inputTouched && autocompleteTouched && !valid;

  function handleMethodSelect({ detail }: CustomEvent<AutocompleteOption>): void {
    method = detail.label;
  }

  function handleInputBlur(): void {
    inputTouched = true;
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function checkValidity(value?: string | null): void {
    valid = !!value;
  }
</script>

<Label text="Brew method *" error={showError} {errorMessage} class="relative">
  <input
    class="input autocomplete"
    class:input-error={showError}
    type="text"
    placeholder="Brew method, e.g. V60"
    bind:value={method}
    use:popup={popupMethodAutocomplete}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
  <div class="autocomplete-token" tabindex="-1" data-popup="popupMethodAutocomplete">
    <Autocomplete options={methodOptions} bind:input={method} on:selection={handleMethodSelect} />
  </div>
</Label>
