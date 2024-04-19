<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  export let process: string | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Process">
  <input
    class="input"
    type="text"
    placeholder="Process, e.g. Washed"
    bind:value={process}
    on:keydown={handleInputKeydown}
  />
</Label>
