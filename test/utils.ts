import worker from "@/index";
// @ts-ignore
import mapValuesDeep from 'map-values-deep'

export async function testGraphql(query: string, status: number, expected: any) {
  const env = getMiniflareBindings()
  const req = new Request('http://localhost/graphql', {
    method: 'POST',
    body: query
  })
  const res = await worker.fetch(req, env, ctx)
  expect([
    res.status,
    mapValuesDeep(await res.json(), (x: any) => x === null ? '<null>' : x)
  ]).toStrictEqual([status, expected])
}

export const ctx: ExecutionContext = {
  waitUntil(promise: Promise<any>) {
  },
  passThroughOnException() {
  }
}
