declare module globalThis {
  const MINIFLARE: boolean
}

export async function getCache() {
// Note: the partition is just for local dev so that each part of the app has its own cache.
  // In production, we want everything to share a Cache as much as possible
  const key = getCacheKey()
  console.log({key})
  return await caches.open(key)
}

function getCacheKey() {
  // In test mode, we want a way for each DO class & the eyeball to
  // to have their own cache so we can test propagation
  if (typeof globalThis.MINIFLARE !== 'undefined') {
    try {
      throw new Error()
    } catch (e: any) {
      // Todo: not this, obviously. Never this.
      const namespaceName = e.stack.match(/HoloModel.fetch(\w+)/)
      return namespaceName ? `holodb:${namespaceName[1]}` : `holodb:edge`
    }
  }
  // Since we run in different data centres, we wanna use the same cache
  return 'holodb'
}
