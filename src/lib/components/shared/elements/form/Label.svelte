<script lang="ts">
  import { faWarning } from '@fortawesome/free-solid-svg-icons';
  import type { Snippet } from 'svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    text: string;
    error?: boolean;
    errorMessage?: string;
    preventDefault?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    text,
    error = false,
    errorMessage,
    preventDefault = false,
    class: clazz,
    children,
  }: Props = $props();

  function handleClick(event: Event): void {
    if (preventDefault) {
      event.preventDefault();
    }
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<label class="flex flex-col gap-1 w-full @container {clazz ?? ''}" onclick={handleClick}>
  <div class="flex flex-col @md:flex-row @md:justify-between @md:gap-4 mr-3">
    <span>{text}</span>
    {#if error && errorMessage}
      <span class="flex items-center gap-2 text-error-600-300-token">
        <Icon data={faWarning} />
        {errorMessage}
      </span>
    {/if}
  </div>
  {@render children?.()}
</label>
