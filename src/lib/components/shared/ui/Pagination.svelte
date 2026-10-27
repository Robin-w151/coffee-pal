<script lang="ts">
  // Maps to Skeleton v4/v5 `Pagination`. Phase 2: plain buttons until story 16.
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

<!-- MIGRATION_PLACEHOLDER: Pagination -->
<div class="flex justify-center items-center gap-2">
  <button type="button" class="btn" disabled={page === 0} onclick={() => onPageChange(0)}
    >First</button
  >
  <button type="button" class="btn" disabled={page === 0} onclick={() => onPageChange(page - 1)}>
    Previous
  </button>
  <span>{page + 1} / {lastPage + 1}</span>
  <button
    type="button"
    class="btn"
    disabled={page >= lastPage}
    onclick={() => onPageChange(page + 1)}
  >
    Next
  </button>
  <button
    type="button"
    class="btn"
    disabled={page >= lastPage}
    onclick={() => onPageChange(lastPage)}
  >
    Last
  </button>
</div>
