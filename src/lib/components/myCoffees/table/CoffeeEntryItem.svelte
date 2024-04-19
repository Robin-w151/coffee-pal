<script lang="ts">
  import { goto } from '$app/navigation';
  import type { ActiveCoffeeEntry } from '$lib/models/myCoffees';

  export let entry: ActiveCoffeeEntry;

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

<tr tabindex="0" role="button" on:click={handleEntryClick} on:keydown={handleEntryKeyDown}>
  <td>{entry.name}</td>
  <td>{entry.origin ?? 'Unknown'}</td>
  <td>{entry.process ?? 'Unknown'}</td>
  <td>{entry.variety ?? 'Unknown'}</td>
  <td>{entry.trader ?? 'Unknown'}</td>
  <td>{entry.aromas.join(', ')}</td>
</tr>
