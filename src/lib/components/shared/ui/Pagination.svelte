<script lang="ts">
  // Maps to Skeleton v4/v5 `Pagination`. The app counts pages from 0, v4 from 1.
  import {
    faAngleLeft,
    faAngleRight,
    faAnglesLeft,
    faAnglesRight,
  } from '@fortawesome/free-solid-svg-icons';
  import { Pagination } from '@skeletonlabs/skeleton-svelte';
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
</script>

<div class="flex justify-center">
  <Pagination
    count={total}
    {pageSize}
    page={page + 1}
    onPageChange={(details) => onPageChange(details.page - 1)}
  >
    <!-- v4 4.15.2 labels only previous/next (in lower case), and its first/last triggers have no
       disabled state and lack the data attributes its own styles select. -->
    <Pagination.FirstTrigger
      data-scope="pagination"
      data-part="first-trigger"
      aria-label="First page"
      disabled={page === 0}
    >
      <Icon data={faAnglesLeft} />
    </Pagination.FirstTrigger>
    <Pagination.PrevTrigger aria-label="Previous page">
      <Icon data={faAngleLeft} />
    </Pagination.PrevTrigger>
    <Pagination.Context>
      {#snippet children(pagination)}
        {#each pagination().pages as item, index (index)}
          {#if item.type === 'page'}
            <Pagination.Item {...item}>{item.value}</Pagination.Item>
          {:else}
            <Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
          {/if}
        {/each}
      {/snippet}
    </Pagination.Context>
    <Pagination.NextTrigger aria-label="Next page">
      <Icon data={faAngleRight} />
    </Pagination.NextTrigger>
    <Pagination.LastTrigger
      data-scope="pagination"
      data-part="last-trigger"
      aria-label="Last page"
      disabled={page >= lastPage}
    >
      <Icon data={faAnglesRight} />
    </Pagination.LastTrigger>
  </Pagination>
</div>
