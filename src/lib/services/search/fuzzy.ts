export function buildFuseQuery(
  filter: string,
  keys: Array<string | { name: string; weight: number }>,
) {
  const filterTokens = normalizeAndSplit(filter);
  return {
    $and: filterTokens.map((token) => ({
      $or: keys?.map((key) => ({ [typeof key === 'object' ? key.name : key]: token })),
    })),
  };
}

function normalizeAndSplit(filter: string): Array<string> {
  return filter
    .replace(/[/|\\()[\]{}<>!?"'$@€#%&~+\-_*]/g, '')
    .split(' ')
    .filter((token) => !!token);
}
