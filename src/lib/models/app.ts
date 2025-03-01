export interface App {
  updateCheckAvailable: boolean;
  installEvent?: InstallEvent;
}

export interface InstallEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
