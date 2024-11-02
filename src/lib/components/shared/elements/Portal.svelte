<script lang="ts" module>
  import { tick, type Snippet } from 'svelte';

  export function portal(el: HTMLElement, target: HTMLElement | string = 'body') {
    let targetEl;

    async function update(newTarget: HTMLElement | string) {
      target = newTarget;
      if (typeof target === 'string') {
        targetEl = document.querySelector(target);
        if (targetEl === null) {
          await tick();
          targetEl = document.querySelector(target);
        }
        if (targetEl === null) {
          throw new Error(`No element found matching css selector: "${target}"`);
        }
      } else if (target instanceof HTMLElement) {
        targetEl = target;
      } else {
        throw new TypeError(
          `Unknown portal target type: ${
            target === null ? 'null' : typeof target
          }. Allowed types: string (CSS selector) or HTMLElement.`,
        );
      }
      targetEl.appendChild(el);
      el.hidden = false;
    }

    function destroy() {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }

    update(target);

    return {
      update,
      destroy,
    };
  }
</script>

<script lang="ts">
  interface Props {
    target?: HTMLElement | string;
    children?: Snippet;
  }

  let { target = 'body', children }: Props = $props();
</script>

<div use:portal={target} hidden>
  {@render children?.()}
</div>
