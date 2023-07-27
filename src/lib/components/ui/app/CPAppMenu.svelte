<script lang="ts">
  import { faCalculator, faClipboardList } from '@fortawesome/free-solid-svg-icons';
  import { drawerStore } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  function handleClick(): void {
    drawerStore.close();
  }
</script>

<section class="flex flex-col gap-4 p-4">
  <h2 class="h2">Coffee Pal</h2>
  <hr />
  <nav class="list-nav">
    <ul>
      <li>
        <a href="/" on:click={handleClick}>
          <Icon data={faCalculator} />
          <span>Calculator</span>
        </a>
      </li>
      <li>
        <a href="/journal" on:click={handleClick}>
          <Icon data={faClipboardList} />
          <span>Journal</span>
        </a>
      </li>
    </ul>
  </nav>
</section>
