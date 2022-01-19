import { GraphQLResolveInfo } from 'graphql'
import { CreateBody, ResolverContext } from '@/types'
import {fetchSubquery} from "@/fetchSubquery";
import {doUpdate} from "@/doUpdate";

export const getById =
  (NAMESPACE: DurableObjectNamespace) =>
  async (
    parent: any,
    args: { [k: string]: string },
    ctx: ResolverContext,
    info: GraphQLResolveInfo
  ) => {
    const id = args.id
    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections
    return await fetchSubquery(ctx, NAMESPACE, { id }, subQueryNodes)
  }

export const getBySurrogateKey =
  (NAMESPACE: DurableObjectNamespace, keyName: string) =>
  async (
    parent: any,
    args: { [k: string]: string },
    ctx: ResolverContext,
    info: GraphQLResolveInfo
  ) => {
    const name = args[keyName]
    const subQueryNodes = info.fieldNodes[0].selectionSet!.selections
    return await fetchSubquery(ctx, NAMESPACE, { name }, subQueryNodes)
  }

export const createWithSurrogateKey =
  (NAMESPACE: DurableObjectNamespace, keyName: string) =>
  async (
    parent: any,
    args: { input: any },
    ctx: ResolverContext,
    info: GraphQLResolveInfo
  ) => {
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
    ctx: ResolverContext,
    info: GraphQLResolveInfo
  ) => {
    const { id, input } = args
    return await doUpdate(ctx, NAMESPACE, { id }, info, input)
  }

export const updateBySurrogateKey =
  (NAMESPACE: DurableObjectNamespace, keyName: string) =>
  async (
    parent: any,
    args: { input: any; [k: string]: string },
    ctx: ResolverContext,
    info: GraphQLResolveInfo
  ) => {
    const { [keyName]: name, input } = args
    return await doUpdate(ctx, NAMESPACE, { name }, info, input)
  }
