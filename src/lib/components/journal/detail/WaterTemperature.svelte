<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';

  export let waterTemperature: number | undefined;
  export let valid = false;

  const errorMessage = 'water temperature must not be below 1';

  let inputTouched = false;

  $: checkValidity(waterTemperature);
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
    if (typeof value === 'number' && value < 1) {
      valid = false;
      return;
    }

    valid = true;
  }
</script>

<Label text="Water temperature" error={showError} {errorMessage}>
  <input
    class="input"
    class:input-error={showError}
    type="number"
    placeholder="Water temperature, e.g. 98"
    bind:value={waterTemperature}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
</Label>
