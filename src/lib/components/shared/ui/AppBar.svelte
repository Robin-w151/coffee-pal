<script lang="ts">
  // Maps to Skeleton v4/v5 `AppBar`. Phase 1: wraps v2 `AppBar`.
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    lead?: Snippet;
    title: Snippet;
  }

  let { lead: leadContent, title }: Props = $props();
</script>

<AppBar padding="px-4 md:px-2 py-1 md:py-2" shadow="shadow-xl" regionRowMain="max-md:gap-2!">
  {#snippet lead()}
    {@render leadContent?.()}
  {/snippet}
  {@render title()}
</AppBar>
