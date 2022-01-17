import { GraphQLResolveInfo, SelectionNode } from 'graphql'

export async function fetchSubquery(
  NAMESPACE: DurableObjectNamespace,
  refId: string,
  fields: ReadonlyArray<SelectionNode>,
) {
  const id = NAMESPACE.idFromString(refId!)
  const stub = NAMESPACE.get(id)

  const response = await stub.fetch('https://holo.db/subquery', {
    method: 'POST',
    body: JSON.stringify(fields),
  })
  return await response.json()
}

export const getBySurrogateKey = (NAMESPACE: DurableObjectNamespace) => async (
  parent: any,
  args: { [k: string]: string },
  ctx: any,
  info: GraphQLResolveInfo,
) => {
  const key = Object.values(args)[0]
  const subQueryNodes = info.fieldNodes[0].selectionSet!.selections

  const id = NAMESPACE.idFromName(key)
  const stub = NAMESPACE.get(id)

  const response = await stub.fetch('https://holo.db/subquery', {
    method: 'POST',
    body: JSON.stringify(subQueryNodes),
  })
  return await response.json()
}
