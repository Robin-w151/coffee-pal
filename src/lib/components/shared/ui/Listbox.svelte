<script lang="ts" generics="TValue extends string">
  // Maps to Skeleton v4/v5 `Listbox`. Phase 2: plain options until story 16.
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

  function select(option: TValue): void {
    value = option;
    onSelect?.(option);
  }
</script>

<!-- MIGRATION_PLACEHOLDER: Listbox -->
<div class="flex flex-col gap-1" role="listbox">
  {#each options as option (option.value)}
    <div
      class="flex justify-between items-center gap-4 w-full min-w-48 px-4 py-2 cursor-pointer"
      role="option"
      tabindex="0"
      aria-selected={value === option.value}
      onclick={() => select(option.value)}
      onkeydown={(event) => (event.key === 'Enter' || event.key === ' ') && select(option.value)}
    >
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
  {/each}
</div>
