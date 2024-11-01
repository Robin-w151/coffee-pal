<script lang="ts">
  import { goto } from '$app/navigation';
  import { routes } from '$lib/config/routes';

  function handleKeyDown(event: KeyboardEvent): void {
    const num = parseInt(event.key);

    if (!isNaN(num) && num >= 1 && num <= 9 && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      const route = routes[num - 1]?.href;

      if (route) {
        goto(route);
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />
