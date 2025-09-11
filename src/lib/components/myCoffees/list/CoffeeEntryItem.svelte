<script lang="ts">
  import { resolve } from '$app/paths';
  import { getCoffeeLabel, type ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { getDisplayValue, getPreferredLengthUnit } from '$lib/shared/units';
  import { settingsStore } from '$lib/stores/settings';

  interface Props {
    entry: ActiveCoffeeEntry;
  }

  let { entry }: Props = $props();

  const preferredLengthUnit = getPreferredLengthUnit($settingsStore.preferredUnits);

  function title(entry: ActiveCoffeeEntry): string {
    return getCoffeeLabel(entry)!;
  }

  function details(entry: ActiveCoffeeEntry): string {
    const { origin, variety, process, altitude } = entry;
    const altitudeStr = altitude ? `${getDisplayValue(altitude, preferredLengthUnit)}` : undefined;
    return [origin, process, variety, altitudeStr].filter((s) => !!s).join(' | ');
  }
</script>

<a
  class="block min-w-0 flex-1 px-3 py-2 hover:bg-primary-500/10 rounded-md transition ease-out"
  href={resolve(`/my-coffees/[id]`, { id: entry.id })}
>
  <dt class="overflow-hidden text-ellipsis whitespace-nowrap">
    <span>{title(entry)}</span>
  </dt>
  <dd class="font-normal overflow-hidden text-ellipsis whitespace-nowrap">
    <span>{details(entry)}</span>
  </dd>
</a>
<hr />
