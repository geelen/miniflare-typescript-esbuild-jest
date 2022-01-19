import { GraphQLResolveInfo, SelectionNode } from 'graphql'
import { CreateBody, UpdateBody } from '@/types'

export async function fetchSubquery(
  NAMESPACE: DurableObjectNamespace,
  ref: { id: string } | { name: string },
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

export const getById =
  (NAMESPACE: DurableObjectNamespace) =>
  async (
    parent: any,
    args: { [k: string]: string },
    ctx: any,
    info: GraphQLResolveInfo
  ) => {
    const id = args.id
    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections
    return await fetchSubquery(NAMESPACE, { id }, subQueryNodes)
  }

export const getBySurrogateKey =
  (NAMESPACE: DurableObjectNamespace, keyName: string) =>
  async (
    parent: any,
    args: { [k: string]: string },
    ctx: any,
    info: GraphQLResolveInfo
  ) => {
    const name = args[keyName]
    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections
    return await fetchSubquery(NAMESPACE, { name }, subQueryNodes)
  }

export const createWithSurrogateKey =
  (NAMESPACE: DurableObjectNamespace, keyName: string) =>
  async (parent: any, args: { input: any }, ctx: any, info: GraphQLResolveInfo) => {
    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections

    const input = args.input
    const id = NAMESPACE.idFromName(input[keyName])
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

export const updateById =
  (NAMESPACE: DurableObjectNamespace) =>
  async (
    parent: any,
    args: { id: string; input: any },
    ctx: any,
    info: GraphQLResolveInfo
  ) => {
    const { id, input } = args
    const ref = NAMESPACE.idFromString(id)
    const stub = NAMESPACE.get(ref)

    return await doUpdate(stub, info, input)
  }

export const updateBySurrogateKey =
  (NAMESPACE: DurableObjectNamespace, keyName: string) =>
  async (
    parent: any,
    args: { input: any; [k: string]: string },
    ctx: any,
    info: GraphQLResolveInfo
  ) => {
    const { [keyName]: key, input } = args
    const ref = NAMESPACE.idFromName(key)
    const stub = NAMESPACE.get(ref)

    return await doUpdate(stub, info, input)
  }

async function doUpdate(stub: DurableObjectStub, info: GraphQLResolveInfo, input: any) {
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
