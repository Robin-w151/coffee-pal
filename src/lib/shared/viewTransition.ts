import { isViewTransitionAvailable } from './support';

let isViewTransitionInProgress = false;

export function runViewTransition(
  fn: () => void | Promise<void>,
  { useReducedMotion }: { useReducedMotion: boolean } = { useReducedMotion: false },
): void {
  if (isViewTransitionAvailable() && !useReducedMotion) {
    if (isViewTransitionInProgress) {
      return;
    }
    isViewTransitionInProgress = true;
    const transition = document.startViewTransition(fn);
    transition.finished.then(() => {
      isViewTransitionInProgress = false;
    });
  } else {
    fn();
  }
}
