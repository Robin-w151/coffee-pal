import { cubicOut } from 'svelte/easing';

export type Direction = 'both' | 'left' | 'right';

export function scaleX(
  node: Element,
  {
    delay = 0,
    duration = 400,
    easing = cubicOut,
    start = 0,
    opacity = 0,
    direction = 'both',
  }: {
    delay?: number;
    duration?: number;
    easing?: (n: number) => number;
    start?: number;
    opacity?: number;
    direction?: Direction;
  } = {},
) {
  const style = getComputedStyle(node);
  const target_opacity = +style.opacity;
  const transform = style.transform === 'none' ? '' : style.transform;
  const sd = 1 - start;
  const od = target_opacity * (1 - opacity);
  return {
    delay,
    duration,
    easing,
    css: (t: number, u: number) => {
      const scale = 1 - sd * u;
      return `
			transform: ${transform} ${translateX(direction, parseInt(style.width), scale)} scaleX(${scale});
			opacity: ${target_opacity - od * u}
		`;
    },
  };
}

function translateX(direction: Direction, width: number, scale: number): string {
  switch (direction) {
    case 'left':
      return `translateX(${(width * (1 - scale)) / 2}px)`;
    case 'right':
      return `translateX(${(width * scale) / 2}px)`;
    default:
      return '';
  }
}
