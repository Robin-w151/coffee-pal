import { linear } from 'svelte/easing';

export function rollDown(
  node: Element,
  {
    delay = 0,
    duration = 150,
    easing = linear,
  }: {
    delay?: number;
    duration?: number;
    easing?: (n: number) => number;
  } = {},
) {
  const height = node.clientHeight;
  return {
    delay,
    duration,
    easing,
    css: (t: number) => `max-height: ${t * height}px; overflow: hidden`,
  };
}
