<script lang="ts">
  import { page } from '$app/stores';
  import JournalEntryDetail from '$lib/components/journal/JournalEntryDetail.svelte';

  const id = $page.params.id;
</script>

<JournalEntryDetail {id} />
