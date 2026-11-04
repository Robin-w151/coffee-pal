<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    display?: string;
    padding?: string;
    class?: string;
    children?: Snippet;
  }

  let {
    display = 'flex flex-col gap-4',
    padding = 'p-4',
    class: clazz,
    children,
  }: Props = $props();
</script>

<!-- Skeleton's card has no background; this one keeps the form outlines visible on it. -->
<div class="card bg-surface-100 dark:bg-surface-800 {display} {padding} w-full {clazz ?? ''}">
  {@render children?.()}
</div>
