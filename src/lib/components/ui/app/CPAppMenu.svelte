<script lang="ts">
  import { page } from '$app/stores';
  import { faCalculator, faClipboardList, faClose } from '@fortawesome/free-solid-svg-icons';
  import { drawerStore } from '@skeletonlabs/skeleton';
  import { Icon } from 'svelte-awesome';

  const routes = [
    {
      href: '/',
      label: 'Calculator',
      icon: faCalculator,
    },
    {
      href: '/journal',
      label: 'Journal',
      icon: faClipboardList,
    },
  ];

  function handleClick(): void {
    drawerStore.close();
  }

  $: routeActiveClass = (href: string) =>
    $page.url.pathname === href ? 'bg-primary-active-token' : '';
</script>

<section class="flex flex-col gap-4 p-4">
  <div class="flex justify-between items-center">
    <h2 class="h2">Coffee Pal</h2>
    <button class="btn btn-icon hover:variant-soft-primary" on:click={handleClick}>
      <Icon data={faClose} />
    </button>
  </div>
  <hr />
  <nav class="list-nav">
    <ul>
      {#each routes as { href, label, icon } (href)}
        <li>
          <a {href} class={routeActiveClass(href)} on:click={handleClick}>
            <Icon data={icon} />
            <span>{label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</section>
