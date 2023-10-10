export interface App {
  installEvent?: InstallEvent;
  persistentStorage?: boolean;
}

export interface InstallEvent extends Event {
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
