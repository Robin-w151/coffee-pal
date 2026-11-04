<script lang="ts">
  import { page } from '$app/state';
  import NavRail from '#lib/components/shared/ui/NavRail.svelte';
  import { routes } from '#lib/config/routes.ts';
</script>

<NavRail items={routes} pathname={page.url.pathname} />
