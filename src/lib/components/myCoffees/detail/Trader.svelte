<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';

  interface Props {
    trader?: string;
  }

  let { trader = $bindable() }: Props = $props();

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
    placeholder="Trader, e.g. My retro coffee shop"
    bind:value={trader}
    onkeydown={handleInputKeydown}
  />
</Label>
