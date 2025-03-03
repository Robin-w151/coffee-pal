export interface App {
  updateCheckAvailable: boolean;
  checkForUpdateInProgress: boolean;
  installAvailable: boolean;
}

export interface InstallEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
