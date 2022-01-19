import { FieldNode, GraphQLResolveInfo, Kind, SelectionNode } from 'graphql'
import { DoIdentifier, UpdateBody } from '@/types'

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
export const cachedJson = (data: any, init?: ResponseInit) =>
  jsonResponse(data, {
    ...init,
    headers: {
      'cache-control': 'immutable',
      ...init?.headers,
    },
  })

export const isFieldNode = (field: SelectionNode): field is FieldNode =>
  field.kind === Kind.FIELD

export const fieldNames = (fields: ReadonlyArray<SelectionNode>) =>
  fields.filter(isFieldNode).map((f) => f.name.value)
