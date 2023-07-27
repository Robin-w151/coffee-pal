<script lang="ts">
  import { faCalculator, faClipboardList } from '@fortawesome/free-solid-svg-icons';
  import { Icon } from 'svelte-awesome';
</script>

<nav class="card variant-filled-surface list-nav p-4 shadow-xl">
  <ul>
    <li>
      <a href="/">
        <Icon data={faCalculator} />
        <span>Calculator</span>
      </a>
    </li>
    <li>
      <a href="/journal">
        <Icon data={faClipboardList} />
        <span>Journal</span>
      </a>
    </li>
  </ul>
</nav>
