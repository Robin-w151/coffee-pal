<script lang="ts">
  import { browser } from '$app/environment';
  import { debounceTime, fromEvent, tap } from 'rxjs';
  import type { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';
  import { onMount } from 'svelte';

  let visible = browser ? (navigator.windowControlsOverlay?.visible ?? false) : false;

  onMount(() => {
    if ('windowControlsOverlay' in navigator) {
      fromEvent(
        navigator.windowControlsOverlay as HasEventTargetAddRemove<EventTarget>,
        'geometrychange',
      )
        .pipe(
          debounceTime(250),
          tap((change) => {
            if ('visible' in change) {
              visible = change.visible ?? 'false';
            }
          }),
        )
        .subscribe();
    }
  });
</script>

<div class="drag-handle flex-1 bg-surface-100-800-token" class:visible />

<style lang="scss">
  .drag-handle.visible {
    -webkit-app-region: drag;
  }
</style>
