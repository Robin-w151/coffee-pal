// A module-level singleton instead of context accessors, like the modal and toast services, so
// every overlay is driven the same way.

export type DrawerId = 'app-menu';

export interface DrawerServiceInterface {
  readonly current: DrawerId | undefined;
  open: (id: DrawerId) => void;
  close: () => void;
}

export class DrawerService implements DrawerServiceInterface {
  private openId = $state<DrawerId | undefined>(undefined);

  get current(): DrawerId | undefined {
    return this.openId;
  }

  open = (id: DrawerId): void => {
    this.openId = id;
  };

  close = (): void => {
    this.openId = undefined;
  };
}

export const drawer = new DrawerService();
