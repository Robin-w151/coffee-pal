<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `Listbox` (single selection).
  import { faCheck, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import { Listbox, useListCollection } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';

  interface Option {
    value: TValue;
    label: string;
    icon?: IconDefinition;
  }

  interface Props {
    value: TValue;
    options: ReadonlyArray<Option>;
    /** Called on every click, also on the selected option. */
    onSelect?: (value: TValue) => void;
  }

  let { value = $bindable(), options, onSelect }: Props = $props();

  const collection = $derived(
    useListCollection<Option>({
      items: [...options],
      itemToValue: (option) => option.value,
      itemToString: (option) => option.label,
    }),
  );

  let highlightedValue = $state<string | null>(null);

  // v4 reports changes only, and only after its own event handling (the popover around it may close
  // first). Clicks and Enter select directly, so `value` and onSelect also see the current option.
  function handleValueChange(details: { value: Array<string> }): void {
    const option = options.find((candidate) => candidate.value === details.value[0]);
    if (option) {
      value = option.value;
    }
  }

  function select(option: Option): void {
    value = option.value;
    onSelect?.(option.value);
  }

  function handleContentKeydown(event: KeyboardEvent): void {
    const option = options.find((candidate) => candidate.value === highlightedValue);
    if (event.key === 'Enter' && option) {
      select(option);
    }
  }
</script>

<Listbox
  {collection}
  value={[value]}
  onValueChange={handleValueChange}
  onHighlightChange={(details) => (highlightedValue = details.highlightedValue)}
>
  <Listbox.Content onkeydown={handleContentKeydown}>
    {#each options as option (option.value)}
      <Listbox.Item item={option} onclick={() => select(option)}>
        <div class="flex justify-between items-center gap-4 w-full min-w-48">
          <div class="flex items-center gap-2">
            {#if option.icon}
              <Icon data={option.icon} />
            {/if}
            <Listbox.ItemText>{option.label}</Listbox.ItemText>
          </div>
          {#if value === option.value}
            <Icon data={faCheck} />
          {/if}
        </div>
      </Listbox.Item>
    {/each}
  </Listbox.Content>
</Listbox>
