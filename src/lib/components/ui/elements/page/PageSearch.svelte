<script lang="ts" context="module">
  type PageSearchSort = 'asc' | 'desc';
</script>

<script lang="ts">
  import {
    faArrowUpAZ,
    faArrowUpWideShort,
    faArrowUpZA,
    faClose,
    faSearch,
  } from '@fortawesome/free-solid-svg-icons';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { createEventDispatcher, tick } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { fade } from 'svelte/transition';
  import { scaleX } from '../../transitions/scaleX';
  import Spinner from '../Spinner.svelte';
  import InputButton from '../form/InputButton.svelte';

  export let title: string;
  export let sort: PageSearchSort | null = 'asc';
  export let isLoading = false;

  const dispatch = createEventDispatcher();
  const sortPopup: PopupSettings = {
    event: 'click',
    target: 'sort-popup',
    placement: 'bottom',
  };

  let searchInput = '';
  let searchInputRef: HTMLInputElement;
  let isSearchActive = false;

  $: handleSearchInputChange(searchInput);
  $: headerSearchActiveClass = isSearchActive
    ? 'card flex-col !items-start px-4 py-4 h-auto transition ease-out duration-250'
    : '';

  $: isChangeSortOrderButtonDisabled = !!searchInput;
  $: changeSortOrderButtonTitle = isChangeSortOrderButtonDisabled
    ? 'Sort order is determined by search input'
    : 'Change sort order';

  async function handleSearchClick(): Promise<void> {
    isSearchActive = true;
    await tick();
    searchInputRef.focus();
  }

  function handleSearchInputChange(searchInput: string): void {
    dispatch('searchChange', searchInput);
  }

  function handleSearchInputClearClick(): void {
    searchInput = '';
    searchInputRef.focus();
  }

  function handleSortClick(): void {
    dispatch('sortToggle');
  }

  async function handleKeyDown(event: KeyboardEvent): Promise<void> {
    const { key, ctrlKey, metaKey } = event;
    if (key === 'k' && (ctrlKey || metaKey)) {
      event.preventDefault();
      isSearchActive = true;
      await tick();
      searchInputRef.focus();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<header class="flex justify-between items-center gap-4 px-2 w-full h-12 {headerSearchActiveClass}">
  <div class="flex items-center gap-4 w-full">
    <h2 class="h2">{title}</h2>
    {#if isSearchActive && isLoading}
      <Spinner />
    {/if}
  </div>
  <div class="grid grid-cols-[auto_max-content] items-center gap-2" class:w-full={isSearchActive}>
    {#if isSearchActive}
      <InputButton title="Clear" visible={!!searchInput} on:click={handleSearchInputClearClick}>
        <input
          class="input"
          type="text"
          placeholder="Search..."
          bind:value={searchInput}
          bind:this={searchInputRef}
          in:scaleX={{ direction: 'left', duration: 250 }}
        />
        <svelte:fragment slot="button-content">
          <Icon data={faClose} />
        </svelte:fragment>
      </InputButton>
    {:else}
      <button
        class="btn btn-icon variant-ghost-secondary"
        title="Search"
        on:click={handleSearchClick}
        in:fade={{ duration: 250 }}
      >
        <Icon data={faSearch} />
      </button>
    {/if}
    {#if $$slots.popup}
      <button
        class="btn btn-icon {isSearchActive ? 'variant-filled-primary' : 'variant-ghost-secondary'}"
        title={changeSortOrderButtonTitle}
        disabled={isChangeSortOrderButtonDisabled}
        use:popup={sortPopup}
      >
        <Icon data={faArrowUpWideShort} />
      </button>
      <div class="popup-token" data-popup="sort-popup">
        <slot name="popup" />
      </div>
    {:else}
      <button
        class="btn btn-icon {isSearchActive ? 'variant-filled-primary' : 'variant-ghost-secondary'}"
        title={changeSortOrderButtonTitle}
        disabled={isChangeSortOrderButtonDisabled}
        on:click={handleSortClick}
      >
        {#if sort === 'asc'}
          <Icon data={faArrowUpAZ} />
        {:else}
          <Icon data={faArrowUpZA} />
        {/if}
      </button>
    {/if}
  </div>
</header>
