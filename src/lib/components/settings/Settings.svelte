<script lang="ts">
  import PageCard from '../shared/elements/page/PageCard.svelte';
  import PageHeader from '../shared/elements/page/PageHeader.svelte';
  import Appearance from './sections/Appearance.svelte';
  import Backup from './sections/Backup.svelte';
  import Developer from './sections/Developer.svelte';
  import Info from './sections/Info.svelte';
  import Nextcloud from './sections/Nextcloud.svelte';
  import Units from './sections/Units.svelte';
</script>

<PageHeader title="Settings" />
<PageCard display="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4">
  <Appearance />
  <hr class="lg:divider-vertical lg:h-full" />
  <Units />
  <hr class="col-span-full" />
  <Nextcloud />
  <hr class="lg:divider-vertical lg:h-full" />
  <Backup />
  <hr class="col-span-full" />
  <Info cardClass="col-span-full" />
  <hr class="col-span-full" />
  <Developer cardClass="col-span-full" />
</PageCard>
