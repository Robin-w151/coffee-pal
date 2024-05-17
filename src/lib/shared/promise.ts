import { tick } from 'svelte';

type Resolve<T> = (value?: T) => void;
type Reject = (reason?: any) => void;

interface WithResolvers<T> {
  promise: Promise<T>;
  resolve: Resolve<T>;
  reject: Reject;
}

export function withResolvers<T>(): WithResolvers<T> {
  let resolve: Resolve<T> | undefined = undefined;
  let reject: Reject | undefined = undefined;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject } as unknown as WithResolvers<T>;
}

export function waitAndTick(timeout: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeout)).then(tick);
}
