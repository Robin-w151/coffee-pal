<script lang="ts">
  import { page } from '$app/stores';
  import NavRail from '$lib/components/ui/NavRail.svelte';
  import { routes } from '$lib/config/routes';
</script>

<NavRail items={routes} pathname={$page?.url?.pathname} />
