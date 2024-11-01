<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  interface Props {
    process?: string;
  }

  let { process = $bindable() }: Props = $props();

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
    onkeydown={handleInputKeydown}
  />
</Label>
