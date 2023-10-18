export function clsx(...values: Array<any>): string {
  return values
    .filter(Boolean)
    .filter((v) => typeof v === 'string')
    .join(' ');
}
