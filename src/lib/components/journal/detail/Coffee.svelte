<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';

  export let coffee: number | undefined;
  export let valid = false;

  const errorMessages = {
    required: 'amount of coffee is required',
    negative: 'amount of coffee must not be below 1',
  };

  let errorMessage: string | undefined;
  let inputTouched = false;

  $: checkValidity(coffee);
  $: showError = inputTouched && !valid;

  function handleInputBlur(): void {
    inputTouched = true;
  }

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }

  function checkValidity(value?: number | null): void {
    if (typeof value !== 'number') {
      valid = false;
      errorMessage = errorMessages.required;
      return;
    }

    if (value < 1) {
      valid = false;
      errorMessage = errorMessages.negative;
      return;
    }

    valid = true;
    errorMessage = undefined;
  }
</script>

<Label text="Amount of coffee *" error={showError} {errorMessage}>
  <input
    class="input"
    class:input-error={showError}
    type="number"
    placeholder="Amount of coffee, e.g. 12"
    bind:value={coffee}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
</Label>
