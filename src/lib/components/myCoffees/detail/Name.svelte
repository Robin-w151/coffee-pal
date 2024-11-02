<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  interface Props {
    name?: string;
    valid?: boolean;
  }

  let { name = $bindable(), valid = $bindable(false) }: Props = $props();

  const errorMessage = 'name is required';

  let inputTouched = $state(false);
  let showError = $derived(inputTouched && !valid);

  $effect(() => {
    checkValidity(name);
  });

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
    onblur={handleInputBlur}
    onkeydown={handleInputKeydown}
  />
</Label>
