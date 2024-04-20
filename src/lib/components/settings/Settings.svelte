<script lang="ts">
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageHeader from '../shared/elements/page/PageHeader.svelte';
  import Appearance from './options/Appearance.svelte';
  import Backup from './options/Backup.svelte';
  import Info from './options/Info.svelte';
  import Nextcloud from './options/Nextcloud.svelte';
  import Units from './options/Units.svelte';
</script>

<PageHeader title="Settings" />
<PageCard display="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
  <Appearance />
  <hr class="lg:divider-vertical lg:h-full" />
  <Units />
  <hr class="lg:col-span-3" />
  <Nextcloud />
  <hr class="lg:divider-vertical lg:h-full" />
  <Backup />
  <hr class="lg:col-span-3" />
  <Info cardClass="lg:col-span-3" />
</PageCard>
