<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `Listbox`. Phase 1: wraps v2 `ListBox`/`ListBoxItem` (single selection).
  import { faCheck, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  interface Props {
    value: TValue;
    options: ReadonlyArray<{
      value: TValue;
      label: string;
      icon?: IconDefinition;
    }>;
    /** Called on every click, also on the selected option. */
    onSelect?: (value: TValue) => void;
  }

  let { value = $bindable(), options, onSelect }: Props = $props();
</script>

<ListBox>
  {#each options as option (option.value)}
    <ListBoxItem
      name={option.label}
      value={option.value}
      bind:group={value}
      on:click={() => onSelect?.(option.value)}
    >
      <div class="flex justify-between items-center gap-4 w-full min-w-48">
        <div class="flex items-center gap-2">
          {#if option.icon}
            <Icon data={option.icon} />
          {/if}
          <span>{option.label}</span>
        </div>
        {#if value === option.value}
          <Icon data={faCheck} />
        {/if}
      </div>
    </ListBoxItem>
  {/each}
</ListBox>
