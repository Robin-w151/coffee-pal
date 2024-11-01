<script lang="ts">
  import {
    faArrowUpAZ,
    faArrowUpWideShort,
    faArrowUpZA,
    faClose,
    faSearch,
  } from '@fortawesome/free-solid-svg-icons';
  import { popup, type PopupSettings } from '@skeletonlabs/skeleton';
  import { createEventDispatcher, tick, type Snippet } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { fade } from 'svelte/transition';
  import { scaleX } from '../../transitions/scaleX';
  import Spinner from '../Spinner.svelte';
  import InputWithButton from '../form/InputWithButton.svelte';

  type PageSearchSort = 'asc' | 'desc';

  interface Props {
    title: string;
    search?: string | null;
    sort?: PageSearchSort | null;
    isLoading: boolean;
    popupContent?: Snippet;
    onSearchChange: (searchInput?: string | null) => void;
  }

  let {
    title,
    search = '',
    sort = 'asc',
    isLoading = false,
    popupContent,
    onSearchChange,
  }: Props = $props();

  const dispatch = createEventDispatcher();
  const sortPopup: PopupSettings = {
    event: 'click',
    target: 'sort-popup',
    placement: 'bottom',
  };

  let searchInputRef: HTMLInputElement | undefined = $state();
  let isSearchActive = $state(!!search);
  let isChangeSortOrderButtonDisabled = $derived(!!search);
  let headerSearchActiveClass = $derived(
    isSearchActive
      ? 'card flex-col !items-start px-4 py-4 h-auto transition ease-out duration-250'
      : '',
  );
  let changeSortOrderButtonTitle = $derived(
    isChangeSortOrderButtonDisabled
      ? 'Sort order is determined by search input'
      : 'Change sort order',
  );

  $effect(() => {
    handleSearchInputChange(search);
  });

  async function handleSearchClick(): Promise<void> {
    isSearchActive = true;
    await tick();
    searchInputRef?.focus();
  }

  function handleSearchInputChange(searchInput?: string | null): void {
    onSearchChange(searchInput);
  }

  function handleSearchInputClearClick(): void {
    search = '';
    searchInputRef?.focus();
  }

  function handleSortClick(): void {
    dispatch('sortToggle');
  }

  async function handleKeyDown(event: KeyboardEvent): Promise<void> {
    const { key, ctrlKey, metaKey } = event;
    if (['f', 'k'].includes(key) && (ctrlKey || metaKey)) {
      event.preventDefault();
      isSearchActive = true;
      await tick();
      searchInputRef?.focus();
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<header class="flex justify-between items-center gap-4 px-2 w-full h-12 {headerSearchActiveClass}">
  <div class="flex items-center gap-4 w-full">
    <h2 class="page-header-title">
      <span>{title}</span>
    </h2>
    {#if isSearchActive && isLoading}
      <Spinner />
    {/if}
  </div>
  <div class="grid grid-cols-[auto_max-content] items-center gap-2" class:w-full={isSearchActive}>
    {#if isSearchActive}
      <InputWithButton title="Clear" visible={!!search} onclick={handleSearchInputClearClick}>
        <input
          class="input"
          type="text"
          placeholder="Search..."
          bind:value={search}
          bind:this={searchInputRef}
          in:scaleX={{ direction: 'left', duration: 250 }}
        />
        {#snippet buttonContent()}
          <Icon data={faClose} />
        {/snippet}
      </InputWithButton>
    {:else}
      <button
        class="btn btn-icon variant-ghost-secondary"
        title="Search"
        onclick={handleSearchClick}
        in:fade={{ duration: 250 }}
      >
        <Icon data={faSearch} />
      </button>
    {/if}
    {#if popupContent}
      <button
        class="btn btn-icon {isSearchActive ? 'variant-filled-primary' : 'variant-ghost-secondary'}"
        title={changeSortOrderButtonTitle}
        disabled={isChangeSortOrderButtonDisabled}
        use:popup={sortPopup}
      >
        <Icon data={faArrowUpWideShort} />
      </button>
      <div class="popup-token" data-popup="sort-popup">
        {@render popupContent()}
      </div>
    {:else}
      <button
        class="btn btn-icon {isSearchActive ? 'variant-filled-primary' : 'variant-ghost-secondary'}"
        title={changeSortOrderButtonTitle}
        disabled={isChangeSortOrderButtonDisabled}
        onclick={handleSortClick}
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
