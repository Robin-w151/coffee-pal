<script lang="ts">
  // Maps to Skeleton v4/v5 `Pagination`. Phase 1: wraps v2 `Paginator`.
  import { Paginator } from '@skeletonlabs/skeleton';

  interface Props {
    /** Zero-based, as the stores count pages. */
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  }

  let { page, pageSize, total, onPageChange }: Props = $props();

  const settings = $derived({ page, limit: pageSize, size: total, amounts: [] });
</script>

<Paginator
  {settings}
  showFirstLastButtons
  showPreviousNextButtons
  justify="justify-center"
  on:page={({ detail }: CustomEvent<number>) => onPageChange(detail)}
/>
