import { DoIdentifier, ResolverContext } from '@/types'
import { SelectionNode } from 'graphql'
import { getCache } from '@/cache'
import { cachedJson, fieldNames, isFieldNode } from '@/utils'

export async function fetchSubquery(
  ctx: ResolverContext,
  NAMESPACE: DurableObjectNamespace,
  ref: DoIdentifier,
  fields: ReadonlyArray<SelectionNode>
) {
  const id = 'id' in ref ? NAMESPACE.idFromString(ref.id) : NAMESPACE.idFromName(ref.name)

  const cache = await getCache()
  const cachedFields: Record<string, any> = {}
  const uncachedFields: SelectionNode[] = []

  await Promise.all(
    fields.map(async (field) => {
      // No idea how to handle these yet
      if (!isFieldNode(field)) {
        uncachedFields.push(field)
        return
      }

      const fieldName = field.name.value
      const cacheKey = `${id.toString()}/${fieldName}`
      const match = await cache.match(`https://holo.db/${cacheKey}`)
      if (match) {
        cachedFields[fieldName] = await match.json()
        ctx.cacheTraces.push(`${cacheKey} HIT`)
      } else {
        uncachedFields.push(field)
        ctx.cacheTraces.push(`${cacheKey} MISS`)
      }
    })
  )

  if (uncachedFields.length > 0) {
    const stub = NAMESPACE.get(id)
    const response = await stub.fetch('https://holo.db/subquery', {
      method: 'POST',
      body: JSON.stringify(uncachedFields),
    })
    const newData = (await response.json()) as Record<string, any>
    await Promise.all(
      Object.entries(newData).map(async ([fieldName, result]) => {
        const cacheKey = `${id.toString()}/${fieldName}`
        await cache.put(`https://holo.db/${cacheKey}`, cachedJson(result))
      })
    )
    Object.assign(cachedFields, newData)
  }

  return cachedFields
}
