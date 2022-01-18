declare module globalThis {
  const MINIFLARE: boolean
}

export async function Cache(partition: string) {
// Note: the partition is just for local dev so that each part of the app has its own cache.
  // In production, we want everything to share a Cache as much as possible
  const key = typeof globalThis.MINIFLARE !== 'undefined' ? partition : `holodb`
  return await caches.open(key)
}
