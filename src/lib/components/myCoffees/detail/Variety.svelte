<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  interface Props {
    variety?: string;
  }

  let { variety = $bindable() }: Props = $props();

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
    onkeydown={handleInputKeydown}
  />
</Label>
