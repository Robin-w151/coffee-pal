export interface App {
  updateCheckAvailable: boolean;
  checkForUpdateInProgress: boolean;
  installEvent?: InstallEvent;
}

export interface InstallEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
