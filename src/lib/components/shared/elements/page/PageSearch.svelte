<script lang="ts">
  import PageTitle from './PageTitle.svelte';
  import {
    faArrowUpAZ,
    faArrowUpWideShort,
    faArrowUpZA,
    faClose,
    faSearch,
  } from '@fortawesome/free-solid-svg-icons';
  import { tick, untrack, type Snippet } from 'svelte';
  import { Icon } from 'svelte-awesome';
  import { fade } from 'svelte/transition';
  import { scaleX } from '../../transitions/scaleX';
  import Spinner from '../Spinner.svelte';
  import InputWithButton from '../form/InputWithButton.svelte';
  import Popover from '$lib/components/shared/ui/Popover.svelte';

  type PageSearchSort = 'asc' | 'desc';

  interface Props {
    title: string;
    search?: string | null;
    sort?: PageSearchSort | null;
    isLoading: boolean;
    popupContent?: Snippet;
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
  let isSearchActive = $state(untrack(() => !!search));
  const isChangeSortOrderButtonDisabled = $derived(!!search);
  const headerSearchActiveClass = $derived(
    isSearchActive
      ? 'card bg-surface-50-950 flex-col items-start! px-4 py-4 h-auto transition ease-out duration-250'
      : '',
  );
  const changeSortOrderButtonTitle = $derived(
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

<svelte:window on:keydown={handleKeyDown} />

<header class="flex justify-between items-center gap-4 px-2 w-full h-12 {headerSearchActiveClass}">
  <div class="flex items-center gap-4 w-full">
    <PageTitle {title} />
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
        class="btn btn-icon preset-tonal-secondary border border-secondary-500"
        title="Search"
        onclick={handleSearchClick}
        in:fade={{ duration: 250 }}
      >
        <Icon data={faSearch} />
      </button>
    {/if}
    {#if popupContent}
      <Popover content={popupContent}>
        {#snippet trigger(triggerProps)}
          <button
            class="btn btn-icon {isSearchActive
              ? 'preset-filled-primary-500'
              : 'preset-tonal-secondary border border-secondary-500'}"
            title={changeSortOrderButtonTitle}
            disabled={isChangeSortOrderButtonDisabled}
            {...triggerProps}
          >
            <Icon data={faArrowUpWideShort} />
          </button>
        {/snippet}
      </Popover>
    {:else}
      <button
        class="btn btn-icon {isSearchActive
          ? 'preset-filled-primary-500'
          : 'preset-tonal-secondary border border-secondary-500'}"
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
