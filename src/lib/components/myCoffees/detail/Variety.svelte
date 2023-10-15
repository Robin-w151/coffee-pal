<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';

  export let variety: string | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Variety">
  <input
    class="input"
    type="text"
    placeholder="Variety, e.g. Red Bourbon"
    bind:value={variety}
    on:keydown={handleInputKeydown}
  />
</Label>
