<script lang="ts">
  import {
    faArrowUpAZ,
    faArrowUpWideShort,
    faArrowUpZA,
    faClose,
    faSearch,
  } from '@fortawesome/free-solid-svg-icons';
  import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
  import { tick, type Snippet } from 'svelte';
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
    /** Receives a callback that closes the popover, e.g. once an option is picked. */
    popupContent?: Snippet<[() => void]>;
    onSearchChange?: (searchInput?: string | null) => void;
    onSortToggle?: () => void;
  }

  let {
    title,
    search = '',
    sort = 'asc',
    isLoading = false,
    popupContent,
    onSearchChange,
    onSortToggle,
  }: Props = $props();

  let searchInputRef: HTMLInputElement | undefined = $state();
  let isSortPopupOpen = $state(false);
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
    onSearchChange?.(searchInput);
  }

  function handleSearchInputClearClick(): void {
    search = '';
    searchInputRef?.focus();
  }

  function handleSortClick(): void {
    onSortToggle?.();
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

<svelte:window onkeydown={handleKeyDown} />

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
        class="btn btn-icon preset-outlined-secondary-500"
        title="Search"
        onclick={handleSearchClick}
        in:fade={{ duration: 250 }}
      >
        <Icon data={faSearch} />
      </button>
    {/if}
    {#if popupContent}
      <Popover
        open={isSortPopupOpen}
        onOpenChange={(details) => (isSortPopupOpen = details.open)}
        positioning={{ placement: 'bottom-end' }}
      >
        <Popover.Trigger
          class="btn btn-icon {isSearchActive
            ? 'preset-filled-primary-500'
            : 'preset-outlined-secondary-500'}"
          title={changeSortOrderButtonTitle}
          disabled={isChangeSortOrderButtonDisabled}
        >
          <Icon data={faArrowUpWideShort} />
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content class="popup-token">
              {@render popupContent(() => (isSortPopupOpen = false))}
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover>
    {:else}
      <button
        class="btn btn-icon {isSearchActive
          ? 'preset-filled-primary-500'
          : 'preset-outlined-secondary-500'}"
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
