<script lang="ts">
  // Maps to Skeleton v4/v5 `TagsInput`. Duplicates are rejected, as with v2.
  import { faXmark } from '@fortawesome/free-solid-svg-icons';
  import { TagsInput } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    value?: Array<string>;
    name: string;
    placeholder: string;
    /** Colours per tag, applied to each rendered tag. */
    tagColors?: (tag: string) => { color: string; backgroundColor: string };
  }

  let { value = $bindable(), name, placeholder, tagColors }: Props = $props();

  function isNew({ inputValue, value }: { inputValue: string; value: Array<string> }): boolean {
    return !value.includes(inputValue);
  }

  // Escape belongs to the input while it's focused (e.g. not to the page's back handling).
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onkeydown={handleKeydown}>
  <TagsInput
    {name}
    value={value ?? []}
    editable={false}
    validate={isNew}
    onValueChange={(details) => (value = [...details.value])}
  >
    <TagsInput.Control>
      {#each value ?? [] as tag, index (tag)}
        {@const colors = tagColors?.(tag)}
        <TagsInput.Item value={tag} {index}>
          <TagsInput.ItemPreview>
            <!-- The whole tag deletes it on click, as v2's chips did. -->
            <!-- "Remove", since v4's "Delete tag …" would also match the page's Delete button. -->
            <TagsInput.ItemDeleteTrigger
              aria-label="Remove {tag}"
              class="flex items-center gap-2 rounded-base"
              style={colors &&
                `color: ${colors.color}; background-color: ${colors.backgroundColor}`}
            >
              <span>{tag}</span>
              <Icon data={faXmark} />
            </TagsInput.ItemDeleteTrigger>
          </TagsInput.ItemPreview>
        </TagsInput.Item>
      {/each}
      <TagsInput.Input class="flex-1" {placeholder} />
    </TagsInput.Control>
    <TagsInput.HiddenInput />
  </TagsInput>
</div>
