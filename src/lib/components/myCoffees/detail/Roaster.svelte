<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  interface Props {
    roaster?: string;
  }

  let { roaster = $bindable() }: Props = $props();

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Roaster">
  <input
    class="input"
    type="text"
    placeholder="Roaster, e.g. My trendy roaster"
    bind:value={roaster}
    onkeydown={handleInputKeydown}
  />
</Label>
