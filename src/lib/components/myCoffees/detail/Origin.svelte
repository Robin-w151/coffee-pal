<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  export let origin: string | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Origin">
  <input
    class="input"
    type="text"
    placeholder="Origin, e.g. Colombia"
    bind:value={origin}
    on:keydown={handleInputKeydown}
  />
</Label>
