<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  export let grindSettings: string | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Grind settings">
  <input
    class="input"
    type="text"
    placeholder="Grind settings, e.g. 24 clicks"
    bind:value={grindSettings}
    on:keydown={handleInputKeydown}
  />
</Label>
