export function lazyLoad<T>(importFn: () => Promise<T>) {
  let module: Promise<T> | undefined;

  return {
    get handle(): Promise<T> {
      if (!module) {
        module = importFn();
      }

      return module;
    },
  };
}
