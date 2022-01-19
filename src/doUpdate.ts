import { DoIdentifier, ResolverContext, UpdateBody } from '@/types'
import { GraphQLResolveInfo } from 'graphql'
import { cachedJson } from '@/utils'
import { getCache } from '@/cache'

export async function doUpdate(
  ctx: ResolverContext,
  NAMESPACE: DurableObjectNamespace,
  ref: DoIdentifier,
  info: GraphQLResolveInfo,
  input: any
) {
  const cache = await getCache()

  const id = 'id' in ref ? NAMESPACE.idFromString(ref.id) : NAMESPACE.idFromName(ref.name)
  const stub = NAMESPACE.get(id)
  const subQueryNodes = info.fieldNodes[0].selectionSet!.selections

  const body: UpdateBody = {
    payload: input,
    subquery: subQueryNodes,
  }
  const response = await stub.fetch('https://holo.db/update', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const newData = (await response.json()) as Record<string, any>
  await Promise.all(
    Object.entries(newData).map(async ([fieldName, result]) => {
      const cacheKey = `${id.toString()}/${fieldName}`
      ctx.cacheTraces.push(`${cacheKey} UPDATE`)
      await cache.put(`https://holo.db/${cacheKey}`, cachedJson(result))
    })
  )
  return newData
}
