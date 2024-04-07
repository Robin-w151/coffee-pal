export interface App {
  installEvent?: InstallEvent;
}

export interface InstallEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
