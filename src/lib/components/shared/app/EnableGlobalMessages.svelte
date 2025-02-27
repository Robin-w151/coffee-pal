<script lang="ts">
  import { toastHelper } from '$lib/shared/ui/toast';
  import { getToastStore } from '@skeletonlabs/skeleton';
  import { onMount } from 'svelte';

  onMount(() => {
    toastHelper.init(getToastStore());
  });
</script>
