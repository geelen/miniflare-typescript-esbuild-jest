import { GraphQLResolveInfo, SelectionNode } from 'graphql'
import { CreateBody } from '@/types'

export async function fetchSubquery(
  NAMESPACE: DurableObjectNamespace,
  refId: string,
  fields: ReadonlyArray<SelectionNode>
) {
  const id = NAMESPACE.idFromString(refId!)
  const stub = NAMESPACE.get(id)

  const response = await stub.fetch('https://holo.db/subquery', {
    method: 'POST',
    body: JSON.stringify(fields),
  })
  return await response.json()
}

export const getById =
  (NAMESPACE: DurableObjectNamespace) =>
  async (
    parent: any,
    args: { [k: string]: string },
    ctx: any,
    info: GraphQLResolveInfo
  ) => {
    const id = Object.values(args)[0]
    const ref = NAMESPACE.idFromString(id)
    const stub = NAMESPACE.get(ref)

    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections

    const response = await stub.fetch('https://holo.db/subquery', {
      method: 'POST',
      body: JSON.stringify(subQueryNodes),
    })
    return await response.json()
  }

export const getBySurrogateKey =
  (NAMESPACE: DurableObjectNamespace) =>
  async (
    parent: any,
    args: { [k: string]: string },
    ctx: any,
    info: GraphQLResolveInfo
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

export const createWithSurrogateKey =
  (NAMESPACE: DurableObjectNamespace, key: string) =>
  async (parent: any, args: { input: any }, ctx: any, info: GraphQLResolveInfo) => {
    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections

    const input = args.input
    const id = NAMESPACE.idFromName(input[key])
    const stub = NAMESPACE.get(id)

    const body: CreateBody = {
      id: id.toString(),
      payload: input,
      subquery: subQueryNodes,
    }
    const response = await stub.fetch('https://holo.db/create', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return await response.json()
  }
