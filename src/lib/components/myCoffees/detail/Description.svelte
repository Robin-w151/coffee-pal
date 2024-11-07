<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { defaultTextAreaRows } from '$lib/shared/ui/styles';

  interface Props {
    description?: string;
  }

  let { description = $bindable() }: Props = $props();

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
    rows={defaultTextAreaRows}
    placeholder="Description..."
    bind:value={description}
    onkeydown={handleInputKeydown}
  ></textarea>
</Label>
