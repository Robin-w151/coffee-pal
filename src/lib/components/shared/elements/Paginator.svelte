<script lang="ts">
  import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';
  import { Pagination } from '@skeletonlabs/skeleton-svelte';
  import { Icon } from 'svelte-awesome';

  interface Props {
    page: number;
    pageSize: number;
    count: number;
    onPageChange: (page: number) => void;
  }

  let { page, pageSize, count, onPageChange }: Props = $props();
</script>

<Pagination
  {page}
  {pageSize}
  {count}
  onPageChange={(details) => onPageChange(details.page)}
  class="flex justify-center"
>
  <Pagination.PrevTrigger class="btn btn-icon hover:preset-tonal" title="Previous page">
    <Icon data={faAngleLeft} />
  </Pagination.PrevTrigger>
  <Pagination.Context>
    {#snippet children(pagination)}
      {#each pagination().pages as pageItem, index (index)}
        {#if pageItem.type === 'page'}
          <Pagination.Item
            {...pageItem}
            class="btn btn-icon {pageItem.value === page
              ? 'preset-filled-primary-500'
              : 'hover:preset-tonal'}"
          >
            {pageItem.value}
          </Pagination.Item>
        {:else}
          <Pagination.Ellipsis {index} class="btn btn-icon">&hellip;</Pagination.Ellipsis>
        {/if}
      {/each}
    {/snippet}
  </Pagination.Context>
  <Pagination.NextTrigger class="btn btn-icon hover:preset-tonal" title="Next page">
    <Icon data={faAngleRight} />
  </Pagination.NextTrigger>
</Pagination>
