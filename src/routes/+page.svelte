<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { mainRoute } from '$lib/config/routes';

  if (browser) {
    goto(mainRoute.href);
  }
</script>
