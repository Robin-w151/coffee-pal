<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import Portal from '$lib/components/shared/elements/Portal.svelte';
  import { methodOptions } from '$lib/config/brewMethods';
  import { autocompletePopupBaseSettings } from '$lib/shared/ui/autocomplete';
  import {
    Autocomplete,
    focusTrap,
    popup,
    type AutocompleteOption,
    type PopupSettings,
  } from '@skeletonlabs/skeleton';

  interface Props {
    method?: string;
    valid?: boolean;
  }

  let { method = $bindable(), valid = $bindable(false) }: Props = $props();

  const errorMessage = 'brew method is required';
  const popupMethodAutocomplete: PopupSettings = {
    ...autocompletePopupBaseSettings,
    target: 'popupMethodAutocomplete',
    state: ({ state }) => {
      if (!state) {
        autocompleteTouched = true;
      }
    },
  };

  let inputTouched = $state(false);
  let autocompleteTouched = $state(false);
  let inputElementRef: HTMLInputElement | undefined = $state();
  let showError = $derived(inputTouched && autocompleteTouched && !valid);

  $effect(() => {
    checkValidity(method);
  });

  function handleMethodSelect({ detail }: CustomEvent<AutocompleteOption>): void {
    method = detail.label;
    inputElementRef?.focus();
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

<Portal target="body">
  <div
    class="autocomplete-token"
    tabindex="-1"
    data-popup="popupMethodAutocomplete"
    use:focusTrap={true}
  >
    <Autocomplete
      options={methodOptions}
      input={method}
      transitions={false}
      on:selection={handleMethodSelect}
    />
  </div>
</Portal>
<Label text="Brew method *" error={showError} {errorMessage} class="relative">
  <input
    class="input autocomplete"
    class:input-error={showError}
    type="text"
    placeholder="Brew method, e.g. V60"
    bind:this={inputElementRef}
    bind:value={method}
    use:popup={popupMethodAutocomplete}
    onblur={handleInputBlur}
    onkeydown={handleInputKeydown}
  />
</Label>
