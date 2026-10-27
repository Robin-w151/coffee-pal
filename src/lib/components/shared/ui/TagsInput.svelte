<script lang="ts">
  // Maps to Skeleton v4/v5 `TagsInput`. Phase 2: a plain input with tag buttons until story 15.
  interface Props {
    value?: Array<string>;
    name: string;
    placeholder: string;
    /** Colours per tag, applied to each rendered tag. */
    tagColors?: (tag: string) => { color: string; backgroundColor: string };
  }

  let { value = $bindable(), name, placeholder, tagColors }: Props = $props();

  let input = $state('');

  function handleKeydown(event: KeyboardEvent): void {
    // Escape belongs to the input while it's focused (e.g. not to the page's back handling).
    if (event.key === 'Escape') {
      event.stopPropagation();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const tag = input.trim();
      if (tag && !(value ?? []).includes(tag)) {
        value = [...(value ?? []), tag];
      }
      input = '';
    }
  }

  function removeTag(tag: string): void {
    value = (value ?? []).filter((other) => other !== tag);
  }
</script>

<!-- MIGRATION_PLACEHOLDER: TagsInput -->
<div class="input flex flex-col gap-2 px-3 py-2">
  <input
    class="w-full"
    type="text"
    {name}
    {placeholder}
    bind:value={input}
    onkeydown={handleKeydown}
  />
  <div class="flex flex-wrap gap-2">
    {#each value ?? [] as tag (tag)}
      {@const colors = tagColors?.(tag)}
      <button
        type="button"
        class="chip"
        style:color={colors?.color}
        style:background-color={colors?.backgroundColor}
        onclick={() => removeTag(tag)}
      >
        <span>{tag}</span>
      </button>
    {/each}
  </div>
</div>
