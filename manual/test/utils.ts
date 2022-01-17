import worker from '@/index'
// @ts-ignore
import mapValuesDeep from 'map-values-deep'

export async function testGraphql(query: string, status: number, expected: any) {
  const env = getMiniflareBindings()
  const req = new Request('http://localhost/graphql', {
    method: 'POST',
    body: query,
  })
  const res = await worker.fetch(req, env, ctx)
  expect([
    res.status,
    mapValuesDeep(await res.json(), (x: any) => (x === null ? '<null>' : x)),
  ]).toStrictEqual([status, expected])
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
