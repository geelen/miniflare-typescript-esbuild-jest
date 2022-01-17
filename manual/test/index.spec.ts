import worker from '@/index'
import {ctx} from './utils'
// @ts-ignore
import mapValuesDeep from 'map-values-deep'

test('should redirect to example page on no route match', async () => {
  const env = getMiniflareBindings()
  const res = await worker.fetch(new Request('http://localhost'), env, ctx)
  expect(res.status).toBe(404)
})

describe('single object', () => {
  beforeEach(async () => {
    const env = getMiniflareBindings()
    const {HOLODB_USER} = env
    const id = HOLODB_USER.idFromName('glen')
    const storage = await getMiniflareDurableObjectStorage(id)
    await storage.put('email', 'glen@glen.com')
    await storage.put('avatar', 'https://www.fillmurray.com/250/250')
  })

  test('single field', async () => {
    const env = getMiniflareBindings()
    const req = new Request('http://localhost/graphql', {
      method: 'POST',
      body: `
        query {
          getUserByUsername(username: "glen") {
            email
          }
        }
      `,
    })
    const res = await worker.fetch(req, env, ctx)
    expect([res.status, await res.json()]).toMatchObject([
      200,
      {
        ok: true,
        errors: [],
        data: {getUserByUsername: {email: 'glen@glen.com'}},
      },
    ])
  })

  test('two fields', async () => {
    const env = getMiniflareBindings()
    const req = new Request('http://localhost/graphql', {
      method: 'POST',
      body: `
        query {
          getUserByUsername(username: "glen") {
            email
            avatar
          }
        }
      `,
    })
    const res = await worker.fetch(req, env, ctx)
    expect([res.status, mapValuesDeep(await res.json(), (x: any) => x === null ? '<null>' : x)]).toMatchObject([200,
      {
        ok: true,
        errors: [],
        data: {getUserByUsername: {email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/250/250'}},
      }]
    )
  })
})

test.skip('should pass-through to durable object', async () => {
  const env = getMiniflareBindings()
  const {COUNTER, HOLODB_USER} = env
  const id = HOLODB_USER.idFromName('glen')
  const storage = await getMiniflareDurableObjectStorage(id)
  await storage.put('email', 'glen@glen.com')

  const req = new Request('http://localhost/graphql', {
    method: 'POST',
    body: `
      query {
        userByUsername(username: 'glen') {
          id
          email
          avatar
          posts {
            title
          }
        }
      }
    `,
  })
  const res = await worker.fetch(req, env, ctx)
  expect({
    status: res.status,
    body: await res.json(),
  }).toMatchObject({ok: true})

  const newValue = await storage.get('count')
  expect(newValue).toBe(11)
})
