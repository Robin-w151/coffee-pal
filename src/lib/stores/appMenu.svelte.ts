/**
 * Open state for the app menu drawer.
 *
 * The trigger lives in the app bar while the drawer itself is rendered by the
 * app layout, so the state is shared through this module rather than passed
 * down as props. Replaces Skeleton v2's global drawer store.
 */
class AppMenuState {
  open = $state(false);

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }
}

export const appMenu = new AppMenuState();
