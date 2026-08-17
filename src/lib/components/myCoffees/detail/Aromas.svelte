<script lang="ts">
  import Label from '$lib/components/shared/elements/form/Label.svelte';
  import { getAromaColor } from '$lib/services/myCoffees/colors/colors';
  import { installEventHandler } from '$lib/shared/ui/events';
  import { TagsInput } from '@skeletonlabs/skeleton-svelte';

  interface Props {
    aromas?: Array<string>;
  }

  let { aromas = $bindable() }: Props = $props();
  let tagsInputRef = $state<HTMLDivElement>();

  $effect(() => {
    if (tagsInputRef) {
      const items = [
        ...(tagsInputRef?.querySelectorAll('[data-part="item-preview"]') ?? []),
      ] as Array<HTMLElement>;
      aromas?.forEach((aroma) => {
        const item = items.find((item) =>
          item.textContent?.toLowerCase().includes(aroma.toLowerCase()),
        );
        if (item) {
          const color = getAromaColor(aroma);
          item.style.color = color.color;
          item.style.backgroundColor = color.backgroundColor;
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
    bind:this={tagsInputRef}
    use:installEventHandler={{
      selector: 'input',
      event: 'keydown',
      handler: handleInputKeydown,
    }}
  >
    <TagsInput
      name="aromas"
      value={aromas ?? []}
      onValueChange={(details) => (aromas = details.value)}
    >
      <TagsInput.Control>
        {#each aromas ?? [] as aroma, index (`${aroma}-${index}`)}
          <TagsInput.Item {index} value={aroma}>
            <TagsInput.ItemPreview>
              <TagsInput.ItemText>{aroma}</TagsInput.ItemText>
              <TagsInput.ItemDeleteTrigger />
            </TagsInput.ItemPreview>
            <TagsInput.ItemInput />
          </TagsInput.Item>
        {/each}
        <TagsInput.Input placeholder="Aromas, e.g. Nutty, Dried Fruit" />
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput>
  </div>
</Label>
