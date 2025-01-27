<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';

  interface Props {
    entry: ActiveCoffeeEntry;
  }

  let { entry }: Props = $props();

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
    goto(`/my-coffees/${entry.id}`);
  }
</script>

<tr tabindex="0" role="button" onclick={handleEntryClick} onkeydown={handleEntryKeyDown}>
  <td>{entry.name}</td>
  <td>{entry.origin ?? 'Unknown'}</td>
  <td>{entry.process ?? 'Unknown'}</td>
  <td>{entry.variety ?? 'Unknown'}</td>
  <td>{entry.roaster ?? 'Unknown'}</td>
  <td>{entry.trader ?? 'Unknown'}</td>
  <td>
    <div class="flex flex-wrap gap-1 w-full">
      {#each entry.aromas as aroma (aroma)}
        <span class="chip variant-filled-primary px-2 py-1">{aroma}</span>
      {/each}
    </div>
  </td>
</tr>
