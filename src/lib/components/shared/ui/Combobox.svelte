<script lang="ts" module>
  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  export interface ComboboxOption<T> {
    value: T;
    label: string;
    /** Extra words the `contains` filter matches, e.g. synonyms. */
    keywords?: string;
  }

  export interface ComboboxTrailLink {
    title: string;
    href: string;
    visible: boolean;
    icon: IconDefinition;
  }
</script>

<script lang="ts" generics="T">
  // Maps to Skeleton v4/v5 `Combobox`. Free text is allowed: the input text is the value, and
  // choosing an option is reported through onSelect. `open` stays uncontrolled: when controlled, v4
  // refocuses the input a frame after every close, even after the user has moved to another field.
  import InputWithButton from '$lib/components/shared/elements/form/InputWithButton.svelte';
  import { Combobox, Portal, useCombobox, useListCollection } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';
  import { fade } from 'svelte/transition';

  interface Props {
    value?: string;
    options: Array<ComboboxOption<T>>;
    /** `none` shows the options as given, for callers that filter themselves. */
    filter?: 'contains' | 'none';
    placeholder: string;
    invalid?: boolean;
    /** A link button at the end of the input. */
    trailLink?: ComboboxTrailLink;
    onSelect: (option: ComboboxOption<T>) => void;
    onInputChange?: (text: string) => void;
    onBlur?: () => void;
    onOpenChange?: (open: boolean) => void;
  }

  let {
    value = $bindable(),
    options,
    filter = 'contains',
    placeholder,
    invalid = false,
    trailLink,
    onSelect,
    onInputChange,
    onBlur,
    onOpenChange,
  }: Props = $props();

  const shownOptions = $derived(
    filter === 'contains'
      ? options.filter(({ label, keywords }) =>
          `${label} ${keywords ?? ''}`.toLowerCase().includes((value ?? '').toLowerCase()),
        )
      : options,
  );

  const collection = $derived(
    useListCollection<ComboboxOption<T>>({
      items: shownOptions,
      itemToValue: (option) => option.label,
      itemToString: (option) => option.label,
    }),
  );

  const id = $props.id();
  const combobox = useCombobox(() => ({
    id,
    collection,
    invalid,
    inputValue: value ?? '',
    allowCustomValue: true,
    openOnClick: true,
    positioning: { sameWidth: true },
    onOpenChange: (details) => onOpenChange?.(details.open),
    onInputValueChange: handleInputValueChange,
    onValueChange: handleValueChange,
  }));

  // Selecting an option also replaces the input text; only typing is reported as an input change.
  function handleInputValueChange(details: { inputValue: string; reason?: string }): void {
    value = details.inputValue;
    if (details.reason === 'input-change') {
      onInputChange?.(details.inputValue);
    }
  }

  function handleValueChange(details: { items: Array<ComboboxOption<T>> }): void {
    const [option] = details.items;
    if (option) {
      onSelect(option);
    }
  }

  // Escape closes the list and must go no further, e.g. not to the page's back handling. Closed here
  // too: v4 closes on Escape through a layer it sets up only after opening, so an early Escape
  // would be lost.
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
      if (combobox().open) {
        combobox().setOpen(false);
      }
    }
  }
</script>

<!-- Rendered inside Combobox.Control below; declared here so it isn't a prop of the control. -->
{#snippet input()}
  <Combobox.Input
    class={invalid ? 'input-error' : ''}
    {placeholder}
    onblur={onBlur}
    onkeydown={handleKeydown}
  />
{/snippet}

<Combobox.Provider value={combobox}>
  <Combobox.Control>
    {#if trailLink}
      <InputWithButton title={trailLink.title} visible={trailLink.visible} href={trailLink.href}>
        {@render input()}
        {#snippet buttonContent()}
          <Icon data={trailLink.icon} />
        {/snippet}
      </InputWithButton>
    {:else}
      {@render input()}
    {/if}
  </Combobox.Control>
  <Portal>
    <Combobox.Positioner>
      <!-- Rendered only while open, to fade in and out as v2's popups did (150ms). v4 hides closed
           content at once, so `hidden` is kept off while it fades out. -->
      <Combobox.Content class="max-h-48 overflow-y-auto">
        {#snippet element(attributes)}
          {#if combobox().open}
            <ul {...attributes} hidden={false} transition:fade={{ duration: 150 }}>
              {#each collection.items as option (option.label)}
                <Combobox.Item item={option}>
                  <Combobox.ItemText>{option.label}</Combobox.ItemText>
                </Combobox.Item>
              {/each}
            </ul>
          {/if}
        {/snippet}
      </Combobox.Content>
    </Combobox.Positioner>
  </Portal>
</Combobox.Provider>
