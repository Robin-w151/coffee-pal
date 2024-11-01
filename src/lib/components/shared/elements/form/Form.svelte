<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { FormEventHandler } from 'svelte/elements';

  interface Props {
    class?: string;
    children?: Snippet;
    onsubmit?: FormEventHandler<HTMLFormElement>;
  }

  let { class: clazz, children, onsubmit }: Props = $props();

  function handleSubmit(event: Event): void {
    event.preventDefault();
    onsubmit?.(event as Event & { currentTarget: EventTarget & HTMLFormElement });
  }
</script>

<form class="flex flex-col gap-4 {clazz ?? ''}" onsubmit={handleSubmit}>
  {@render children?.()}
</form>
