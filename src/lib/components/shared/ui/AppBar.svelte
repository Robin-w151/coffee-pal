<script lang="ts">
  // Maps to Skeleton v4/v5 `AppBar`. Phase 2: plain markup until story 16.
  import type { Snippet } from 'svelte';

  interface Props {
    lead?: Snippet;
    title: Snippet;
  }

  let { lead, title }: Props = $props();
</script>

<!-- MIGRATION_PLACEHOLDER: AppBar -->
<div
  class="flex items-center gap-2 md:gap-4 px-4 md:px-2 py-1 md:py-2 shadow-xl bg-surface-100-900"
>
  {@render lead?.()}
  {@render title()}
</div>
