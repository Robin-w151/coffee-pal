<script lang="ts">
  import { goto } from '$app/navigation';
  import { resolve } from '$app/paths';
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';
  import { getAromaColor } from '$lib/services/myCoffees/colors/colors';
  import { getDisplayValue, getPreferredLengthUnit } from '$lib/shared/units';
  import { settingsStore } from '$lib/stores/settings';

  interface Props {
    entry: ActiveCoffeeEntry;
  }

  let { entry }: Props = $props();

  const preferredLengthUnit = getPreferredLengthUnit($settingsStore.preferredUnits);

  function handleEntryClick(): void {
    gotoDetail();
  }

  function handleEntryKeyDown(event: KeyboardEvent): void {
    const { code } = event;
    if (code === 'Enter' || code === 'Space') {
      event.preventDefault();
      gotoDetail();
    }
  }

  function gotoDetail(): void {
    goto(resolve(`/my-coffees/[id]`, { id: entry.id }));
  }

  function altitudeDisplayValue(altitude: number): string {
    return getDisplayValue(altitude, preferredLengthUnit);
  }
</script>

<tr tabindex="0" role="button" onclick={handleEntryClick} onkeydown={handleEntryKeyDown}>
  <td>{entry.name}</td>
  <td>{entry.origin ?? 'Unknown'}</td>
  <td>{entry.process ?? 'Unknown'}</td>
  <td>{entry.variety ?? 'Unknown'}</td>
  <td>{entry.altitude ? altitudeDisplayValue(entry.altitude) : 'N/A'}</td>
  <td>{entry.roaster ?? 'Unknown'}</td>
  <td>
    <div class="flex flex-wrap gap-1 w-full">
      {#each entry.aromas as aroma (aroma)}
        {@const { color, backgroundColor } = getAromaColor(aroma)}
        <span
          class="chip variant-filled-primary px-2 py-1"
          style={`color: ${color}; background-color: ${backgroundColor}`}>{aroma}</span
        >
      {/each}
    </div>
  </td>
</tr>
