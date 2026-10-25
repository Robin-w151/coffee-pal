<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import Popover from '$lib/components/ui/Popover.svelte';
  import { methodOptions } from '$lib/config/brewMethods';
  import { Autocomplete, type AutocompleteOption } from '@skeletonlabs/skeleton';

  interface Props {
    method?: string;
    valid?: boolean;
  }

  let { method = $bindable(), valid = $bindable(false) }: Props = $props();

  const errorMessage = 'brew method is required';

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

  function handleAutocompleteOpenChange(open: boolean): void {
    if (!open) {
      autocompleteTouched = true;
    }
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

<Popover
  openOn="focus-click"
  matchWidth
  portal
  trapFocus
  contentClass="autocomplete-token"
  onOpenChange={handleAutocompleteOpenChange}
>
  {#snippet content()}
    <Autocomplete
      options={methodOptions}
      input={method}
      transitions={false}
      on:selection={handleMethodSelect}
    />
  {/snippet}
  {#snippet trigger(triggerProps)}
    <Label text="Brew method *" error={showError} {errorMessage} class="relative">
      <input
        class="input autocomplete"
        class:input-error={showError}
        type="text"
        placeholder="Brew method, e.g. V60"
        bind:this={inputElementRef}
        bind:value={method}
        {...triggerProps}
        onblur={handleInputBlur}
        onkeydown={handleInputKeydown}
      />
    </Label>
  {/snippet}
</Popover>
