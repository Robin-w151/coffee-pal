<script lang="ts">
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageHeader from '../shared/elements/page/PageHeader.svelte';
  import Appearance from './Appearance.svelte';
  import Backup from './Backup.svelte';
  import Info from './Info.svelte';
  import Nextcloud from './Nextcloud.svelte';
  import Units from './Units.svelte';
</script>

<PageHeader title="Settings" />
<PageCard>
  <Appearance />
  <hr />
  <Units />
  <hr />
  <Nextcloud />
  <hr />
  <Backup />
  <hr />
  <Info />
</PageCard>
