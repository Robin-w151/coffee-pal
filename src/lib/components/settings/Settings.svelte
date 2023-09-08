<script lang="ts">
  import PageCard from '../ui/elements/PageCard.svelte';
  import Backup from './Backup.svelte';
  import Info from './Info.svelte';
  import Nextcloud from './Nextcloud.svelte';
</script>

<h2 class="h2">Settings</h2>
<PageCard>
  <Nextcloud />
  <hr />
  <Backup />
  <hr />
  <Info />
</PageCard>
