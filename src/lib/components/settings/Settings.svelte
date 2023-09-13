<script lang="ts">
  import PageCard from '../ui/elements/page/PageCard.svelte';
  import PageHeader from '../ui/elements/page/PageHeader.svelte';
  import Backup from './Backup.svelte';
  import Info from './Info.svelte';
  import Nextcloud from './Nextcloud.svelte';
</script>

<PageHeader title="Settings" />
<PageCard>
  <Nextcloud />
  <hr />
  <Backup />
  <hr />
  <Info />
</PageCard>
