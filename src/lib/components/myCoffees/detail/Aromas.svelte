<script lang="ts">
  import Label from '$lib/components/ui/elements/form/Label.svelte';
  import { installEventHandler } from '$lib/utils/ui/events';
  import { InputChip } from '@skeletonlabs/skeleton';

  export let aromas: Array<string> | undefined;

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Aromas">
  <div
    use:installEventHandler={{
      selector: 'input',
      event: 'keydown',
      handler: handleInputKeydown,
    }}
  >
    <InputChip
      name="aromas"
      placeholder="Aromas, e.g. Nutty, Dried Fruit"
      padding="px-3 py-2"
      regionInput="focus:!outline-none"
      chips="variant-filled-primary"
      bind:value={aromas}
      on:keydown={handleInputKeydown}
    />
  </div>
</Label>
