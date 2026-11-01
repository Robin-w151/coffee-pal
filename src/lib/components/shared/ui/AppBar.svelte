<script lang="ts">
  // Maps to Skeleton v4/v5 `AppBar`.
  import { AppBar } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    lead?: Snippet;
    title: Snippet;
  }

  let { lead, title }: Props = $props();
</script>

<!-- A div: the app layout's <header> is the banner landmark already. md:pl-1 centres the title's
     icon over the rail's icons (40px), as in v2: 4px + the 16px gap after the empty lead + the
     link's 8px padding + half the 24px icon. -->
<AppBar class="px-4 md:pl-1 md:pr-2 py-1 md:py-2 dark:bg-surface-800 shadow-xl">
  {#snippet element(attributes)}
    <div {...attributes}>
      <AppBar.Toolbar class="grid-cols-[auto_1fr] gap-2 md:gap-4">
        <AppBar.Lead>
          {@render lead?.()}
        </AppBar.Lead>
        <AppBar.Headline>
          {@render title()}
        </AppBar.Headline>
      </AppBar.Toolbar>
    </div>
  {/snippet}
</AppBar>
