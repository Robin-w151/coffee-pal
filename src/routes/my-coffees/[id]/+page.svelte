<script lang="ts">
  import { page } from '$app/state';
  import CoffeeEntryDetail from '#lib/components/myCoffees/CoffeeEntryDetail.svelte';

  const id = page.params.id;
</script>

<CoffeeEntryDetail {id} />
