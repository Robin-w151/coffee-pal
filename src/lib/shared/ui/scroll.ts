const scrollPositions = new Map<string, number>();

export function rememberScrollPosition(path: string, scrollTop: number): void {
  scrollPositions.set(path, scrollTop);
}

export function scrollToLastKnownPosition(path?: string): void {
  const scrollTop = (path && scrollPositions.get(path)) || 0;
  scrollPage(scrollTop);
}

export function scrollToTop(): void {
  scrollPage(0);
}

function scrollPage(scrollTop: number): void {
  const page = document.querySelector('#page');
  if (page) {
    page.scrollTop = scrollTop;
  }
}
