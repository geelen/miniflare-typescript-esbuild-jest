import { GraphQLResolveInfo, SelectionNode } from 'graphql'
import { UpdateBody } from '@/types'

type DoIdentifier = { id: string } | { name: string };

export async function fetchSubquery(
  NAMESPACE: DurableObjectNamespace,
  ref: DoIdentifier,
  fields: ReadonlyArray<SelectionNode>
) {
  const id = 'id' in ref ? NAMESPACE.idFromString(ref.id) : NAMESPACE.idFromName(ref.name)
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
