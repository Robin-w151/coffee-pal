export function buildFuseQuery(filter: string, keys: Array<string>) {
  const filterTokens = filter.split(' ').filter((token) => !!token);
  return {
    $and: filterTokens.map((token) => ({
      $or: keys?.map((key) => ({ [key]: token })),
    })),
  };
}
