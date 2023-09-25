<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';

  export let trader: string | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Trader">
  <input
    class="input"
    type="text"
    placeholder="Trader, e.g. Alt Wien"
    bind:value={trader}
    on:keydown={handleInputKeydown}
  />
</Label>
