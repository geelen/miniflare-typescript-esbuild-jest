import { GraphQLResolveInfo, SelectionNode } from 'graphql'
import {ResolverContext, UpdateBody} from '@/types'

type DoIdentifier = { id: string } | { name: string }
declare module globalThis {
  const MINIFLARE: boolean
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

export async function fetchSubquery(
  ctx: ResolverContext,
  NAMESPACE: DurableObjectNamespace,
  ref: DoIdentifier
  , fields: ReadonlyArray<SelectionNode>) {
  const id = 'id' in ref ? NAMESPACE.idFromString(ref.id) : NAMESPACE.idFromName(ref.name)

  const key = getCacheKey()
  console.log({key})
  console.log(fields)

  const stub = NAMESPACE.get(id)

  const response = await stub.fetch('https://holo.db/subquery', {
    method: 'POST',
    body: JSON.stringify(fields),
  })
  return await response.json()
}

export async function doUpdate(
  NAMESPACE: DurableObjectNamespace,
  ref: DoIdentifier,
  info: GraphQLResolveInfo,
  input: any
) {
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
  return await response.json()
}

export const jsonResponse = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
}
