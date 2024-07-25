<script lang="ts">
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';

  export let entry: ActiveCoffeeEntry;

  function title(entry: ActiveCoffeeEntry): string {
    return getCoffeeLabel(entry)!;
  }

  function details(entry: ActiveCoffeeEntry): string {
    const { origin, variety, process } = entry;
    return [origin, process, variety].filter((s) => !!s).join(' | ');
  }
</script>

<a
  class="block min-w-0 flex-1 px-3 py-2 hover:bg-primary-500/10 rounded-md"
  href="/my-coffees/{entry.id}"
>
  <dt class="overflow-hidden text-ellipsis whitespace-nowrap">
    <span>{title(entry)}</span>
  </dt>
  <dd class="font-normal overflow-hidden text-ellipsis whitespace-nowrap">
    <span>{details(entry)}</span>
  </dd>
</a>
<hr />
