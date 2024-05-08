<script lang="ts">
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { faEye } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';

  export let entry: ActiveCoffeeEntry;

  function title(entry: ActiveCoffeeEntry): string {
    return getCoffeeLabel(entry)!;
  }

  function details(entry: ActiveCoffeeEntry): string {
    const { origin, variety, process } = entry;
    return [origin, process, variety].filter((s) => !!s).join(' | ');
  }
</script>

<div class="justify-between">
  <span class="block min-w-0 flex-1">
    <dt class="overflow-hidden text-ellipsis whitespace-nowrap">
      <span class="font-bold">{title(entry)}</span>
    </dt>
    <dd class="overflow-hidden text-ellipsis whitespace-nowrap">
      <span>{details(entry)}</span>
    </dd>
  </span>
  <span class="flex gap-2">
    <a class="btn btn-icon hover:variant-soft-secondary" title="Show" href="/my-coffees/{entry.id}">
      <Icon data={faEye} />
      <span class="sr-only">Show</span>
    </a>
  </span>
</div>
