import worker from '@/index'
// @ts-ignore
import mapValuesDeep from 'map-values-deep'
import { Operation, Selection, SelectionSet, Result } from '@timkendall/tql'
import { IQuery } from '../schema.tql'

export async function testGraphql(
  query: string | { query: string; variables?: any },
  status: number,
  expected: any
) {
  const env = getMiniflareBindings()
  const req = new Request('http://localhost/graphql', {
    method: 'POST',
    body: JSON.stringify(typeof query === 'string' ? { query } : query),
    headers: {
      'content-type': 'application/json',
    },
  })
  const res = await worker.fetch(req, env, ctx)
  const json = await res.json()
  expect([
    res.status,
    mapValuesDeep(json, (x: any) => (x === null ? '<null>' : x)),
  ]).toStrictEqual([status, expected])
  return json as any
}

export async function testGraphqlOK<T = any>(
  query: string,
  variables: any,
  expectedData: T
): Promise<{ data: T }> {
  return (await testGraphql({ query, variables }, 200, {
    ok: true,
    errors: [],
    data: expectedData,
  })) as { data: T }
}

export async function testTqlOK<T extends Array<Selection>>(
  query: Operation<SelectionSet<T>>,
  expectedData: Result<IQuery, SelectionSet<T>>
): Promise<{ data: any }> {
  return (await testGraphql({ query: query.toString(), variables: {} }, 200, {
    ok: true,
    errors: [],
    data: expectedData,
  })) as { data: any }
}

export const ctx: ExecutionContext = {
  waitUntil(promise: Promise<any>) {},
  passThroughOnException() {},
}

export async function createObject(
  namespace: keyof Bindings,
  surrogate: { [k: string]: string },
  fields: { [k: string]: any }
) {
  const env = getMiniflareBindings()
  const [keyField, key] = Object.entries(surrogate)[0]
  const ref = env[namespace].idFromName(key)
  const storage = await getMiniflareDurableObjectStorage(ref)

  // Set created fields
  await storage.put('id', ref.toString())
  const now = new Date().toJSON()
  await storage.put('createdAt', now)
  await storage.put('updatedAt', now)

  await storage.put(keyField, key)
  for (const [k, value] of Object.entries(fields)) {
    await storage.put(k, value)
  }
  return ref.toString()
}

export async function updateObject(
  namespace: keyof Bindings,
  id: string,
  fields: { [k: string]: any }
) {
  const env = getMiniflareBindings()
  const ref = env[namespace].idFromString(id)
  const storage = await getMiniflareDurableObjectStorage(ref)
  for (const [k, value] of Object.entries(fields)) {
    await storage.put(k, value)
  }
  return ref.toString()
}
