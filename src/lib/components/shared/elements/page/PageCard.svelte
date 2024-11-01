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

<div class="card {display} {padding} w-full {clazz ?? ''}">
  {@render children?.()}
</div>
