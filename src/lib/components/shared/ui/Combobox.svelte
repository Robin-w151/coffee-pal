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
  // Maps to Skeleton v4/v5 `Combobox`. Phase 2: an input with plain option buttons until story 16.
  import InputWithButton from '$lib/components/shared/elements/form/InputWithButton.svelte';
  import { Icon } from 'svelte-awesome';
  import Popover from './Popover.svelte';

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

  let inputElement = $state<HTMLInputElement>();

  const shownOptions = $derived(
    filter === 'contains'
      ? options.filter(({ label, keywords }) =>
          `${label} ${keywords ?? ''}`.toLowerCase().includes((value ?? '').toLowerCase()),
        )
      : options,
  );

  function handleSelection(option: ComboboxOption<T>): void {
    onSelect(option);
    inputElement?.focus();
  }

  // Escape closes the list (the popup listens in the capture phase) and must go no further,
  // e.g. not to the page's back handling.
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<Popover
  openOn="focus-click"
  matchWidth
  portal
  trapFocus
  contentClass="card z-10 p-4 max-h-48 bg-surface-200-800 overflow-y-auto shadow-xl"
  {onOpenChange}
>
  {#snippet content()}
    <!-- MIGRATION_PLACEHOLDER: Combobox -->
    <div class="flex flex-col">
      {#each shownOptions as option (option.value)}
        <button
          type="button"
          class="w-full text-start px-4 py-2"
          onclick={() => handleSelection(option)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/snippet}
  {#snippet trigger(triggerProps)}
    {#snippet input()}
      <input
        class="input autocomplete"
        class:input-error={invalid}
        type="text"
        {placeholder}
        bind:this={inputElement}
        bind:value
        {...triggerProps}
        oninput={() => onInputChange?.(value ?? '')}
        onblur={onBlur}
        onkeydown={handleKeydown}
      />
    {/snippet}
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
  {/snippet}
</Popover>
