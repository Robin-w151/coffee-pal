<script lang="ts">
  import { page } from '$app/stores';
  import CoffeeEntryDetail from '$lib/components/myCoffees/CoffeeEntryDetail.svelte';

  const id = $page.params.id;
</script>

<CoffeeEntryDetail {id} />
