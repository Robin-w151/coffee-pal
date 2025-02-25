<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { getAromaColor } from '$lib/services/myCoffees/colors/colors';
  import { installEventHandler } from '$lib/shared/ui/events';
  import { InputChip } from '@skeletonlabs/skeleton';

  interface Props {
    aromas?: Array<string>;
  }

  let { aromas = $bindable() }: Props = $props();
  let inputChipRef = $state<HTMLDivElement>();

  $effect(() => {
    if (inputChipRef) {
      const chips = [
        ...(inputChipRef?.querySelectorAll('button.chip') ?? []),
      ] as Array<HTMLButtonElement>;
      aromas?.forEach((aroma) => {
        const chip = chips.find((chip) =>
          chip.textContent?.toLowerCase().includes(aroma.toLowerCase()),
        );
        if (chip) {
          const color = getAromaColor(aroma);
          chip.style.color = color.color;
          chip.style.backgroundColor = color.backgroundColor;
        }
      });
    }
  });

  function handleInputKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Label text="Aromas">
  <div
    bind:this={inputChipRef}
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
      bind:value={aromas}
      on:keydown={handleInputKeydown}
    />
  </div>
</Label>
