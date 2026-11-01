<script lang="ts">
  // Maps to Skeleton v4/v5 `Pagination`. The app counts pages from 0, v4 from 1.
  import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
  } from '@fortawesome/free-solid-svg-icons';
  import { screens } from '$lib/config/screens';
  import { Pagination } from '@skeletonlabs/skeleton-svelte';
  import { MediaQuery } from 'svelte/reactivity';
  import { Icon } from 'svelte-awesome';

  interface Props {
    /** Zero-based, as the stores count pages. */
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  }

  let { page, pageSize, total, onPageChange }: Props = $props();

  const lastPage = $derived(Math.max(Math.ceil(total / pageSize) - 1, 0));

  // Phones get a compact form, e.g. « ‹ 1 … 5 … 8 › », so it fits the card: one page around the
  // current one and tighter spacing. Below 360px the first/last triggers go too (the first and
  // last page are shown as numbers anyway).
  const isWide = new MediaQuery(`min-width: ${screens.sm}`);
  const triggerClass = 'px-2 sm:px-3';
</script>

<div class="flex justify-center">
  <Pagination
    class="gap-1 p-1 sm:gap-2 sm:p-2"
    count={total}
    {pageSize}
    siblingCount={isWide.current ? 1 : 0}
    page={page + 1}
    onPageChange={(details) => onPageChange(details.page - 1)}
  >
    <!-- v4 4.15.2 labels only previous/next (in lower case), and its first/last triggers have no
       disabled state and lack the data attributes its own styles select. -->
    <Pagination.FirstTrigger
      class="{triggerClass} max-[360px]:hidden"
      data-scope="pagination"
      data-part="first-trigger"
      aria-label="First page"
      disabled={page === 0}
    >
      <Icon data={faAnglesLeft} />
    </Pagination.FirstTrigger>
    <Pagination.PrevTrigger class={triggerClass} aria-label="Previous page">
      <Icon data={faAngleLeft} />
    </Pagination.PrevTrigger>
    <Pagination.Context>
      {#snippet children(pagination)}
        {#each pagination().pages as item, index (index)}
          {#if item.type === 'page'}
            <Pagination.Item class={triggerClass} {...item}>{item.value}</Pagination.Item>
          {:else}
            <Pagination.Ellipsis class={triggerClass} {index}>&#8230;</Pagination.Ellipsis>
          {/if}
        {/each}
      {/snippet}
    </Pagination.Context>
    <Pagination.NextTrigger class={triggerClass} aria-label="Next page">
      <Icon data={faAngleRight} />
    </Pagination.NextTrigger>
    <Pagination.LastTrigger
      class="{triggerClass} max-[360px]:hidden"
      data-scope="pagination"
      data-part="last-trigger"
      aria-label="Last page"
      disabled={page >= lastPage}
    >
      <Icon data={faAnglesRight} />
    </Pagination.LastTrigger>
  </Pagination>
</div>
