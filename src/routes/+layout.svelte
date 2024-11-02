<script lang="ts">
  import AppLayout from '$lib/components/shared/app/AppLayout.svelte';
  import type { Snippet } from 'svelte';

  interface Props {
    children?: Snippet;
  }

  let { children }: Props = $props();
</script>

<AppLayout>
  {@render children?.()}
</AppLayout>
