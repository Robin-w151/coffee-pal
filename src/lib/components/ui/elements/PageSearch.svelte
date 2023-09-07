<script lang="ts" context="module">
  type PageSearchSort = 'asc' | 'desc';
</script>

<script lang="ts">
  import { faArrowUpAZ, faArrowUpZA, faSearch } from '@fortawesome/free-solid-svg-icons';
  import { createEventDispatcher, tick } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { fade } from 'svelte/transition';
  import { scaleX } from '../transitions/scaleX';

  export let title: string;
  export let sort: PageSearchSort | null = 'asc';

  const dispatch = createEventDispatcher();

  let searchInput = '';
  let searchInputRef: HTMLInputElement;
  let isSearchActive = false;

  $: handleSearchInputChange(searchInput);
  $: headerSearchActiveClass = isSearchActive ? 'card flex-col !items-start px-4 py-4 h-auto' : '';

  async function handleSearchClick(): Promise<void> {
    isSearchActive = true;
    await tick();
    searchInputRef.focus();
  }

  function handleSearchInputChange(searchInput: string): void {
    dispatch('searchChange', searchInput);
  }

  function handleSortClick(): void {
    dispatch('sortToggle');
  }
</script>

<header class="flex justify-between items-center gap-4 px-2 w-full h-12 {headerSearchActiveClass}">
  <h2 class="h2">
    {title}
  </h2>
  <div class="grid grid-cols-[auto_max-content] items-center gap-2" class:w-full={isSearchActive}>
    {#if isSearchActive}
      <input
        class="input"
        type="text"
        placeholder="Search..."
        bind:value={searchInput}
        bind:this={searchInputRef}
        in:scaleX={{ direction: 'left', duration: 250 }}
      />
    {:else}
      <button
        class="btn btn-icon variant-ghost-secondary"
        on:click={handleSearchClick}
        in:fade={{ duration: 250 }}
      >
        <Icon data={faSearch} />
      </button>
    {/if}
    <button
      class="btn btn-icon {isSearchActive ? 'variant-filled-primary' : 'variant-ghost-secondary'}"
      on:click={handleSortClick}
    >
      {#if sort === 'asc'}
        <Icon data={faArrowUpAZ} />
      {:else}
        <Icon data={faArrowUpZA} />
      {/if}
    </button>
  </div>
</header>
