<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
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

<!-- v4's card has no background (v2's had one); 50-950 keeps v4's form outlines visible on it. -->
<div class="card bg-surface-100 dark:bg-surface-800 {display} {padding} w-full {clazz ?? ''}">
  {@render children?.()}
</div>
