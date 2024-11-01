<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
  }

  let { class: clazz, children }: Props = $props();
</script>

<div class="flex flex-col gap-4 w-full {clazz ?? ''}">
  {@render children?.()}
</div>
