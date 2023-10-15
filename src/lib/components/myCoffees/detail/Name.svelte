<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';

  export let name: string | undefined;
  export let valid = false;

  const errorMessage = 'name is required';

  let inputTouched = false;

  $: checkValidity(name);
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

  function checkValidity(value?: string | null): void {
    valid = !!value;
  }
</script>

<Label text="Name *" error={showError} {errorMessage}>
  <input
    class="input"
    class:input-error={showError}
    type="text"
    placeholder="Name, e.g. Frutos Rojos"
    bind:value={name}
    on:blur={handleInputBlur}
    on:keydown={handleInputKeydown}
  />
</Label>
