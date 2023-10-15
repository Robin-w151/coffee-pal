<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';

  export let description: string | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Description">
  <textarea
    class="textarea"
    rows={4}
    placeholder="Description..."
    bind:value={description}
    on:keydown={handleInputKeydown}
  />
</Label>
