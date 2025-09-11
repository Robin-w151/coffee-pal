<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import { routes } from '$lib/config/routes';

  function handleKeyDown(event: KeyboardEvent): void {
    const num = parseInt(event.key);

    if (!isNaN(num) && num >= 1 && num <= 9 && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      const route = routes[num - 1]?.href;

      if (route) {
        goto(resolve(route, {}));
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />
