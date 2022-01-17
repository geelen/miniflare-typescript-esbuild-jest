import worker from '@/index'
import { ctx, testGraphql } from './utils'
// @ts-ignore
import mapValuesDeep from 'map-values-deep'

test('should redirect to example page on no route match', async () => {
  const env = getMiniflareBindings()
  const res = await worker.fetch(new Request('http://localhost'), env, ctx)
  expect(res.status).toBe(404)
})

describe('single User', () => {
  beforeEach(async () => {
    const env = getMiniflareBindings()
    const { HOLODB_USER } = env
    const id = HOLODB_USER.idFromName('glen')
    const storage = await getMiniflareDurableObjectStorage(id)
    await storage.put('email', 'glen@glen.com')
    await storage.put('avatar', 'https://www.fillmurray.com/200/200')
  })

  test('single field', async () => {
    await testGraphql(
      `
        query {
          getUserByUsername(username: "glen") {
            email
          }
        }
      `,
      200,
      {
        ok: true,
        errors: [],
        data: {
          getUserByUsername: {
            email: 'glen@glen.com',
          },
        },
      }
    )
  })

  test('two fields', async () => {
    await testGraphql(
      `
        query {
          getUserByUsername(username: "glen") {
            email
            avatar
          }
        }
      `,
      200,
      {
        ok: true,
        errors: [],
        data: {
          getUserByUsername: {
            email: 'glen@glen.com',
            avatar: 'https://www.fillmurray.com/200/200',
          },
        },
      }
    )
  })
})

describe('single Post', () => {
  beforeEach(async () => {
    const env = getMiniflareBindings()
    const { HOLODB_USER, HOLODB_POST } = env
    const userId = HOLODB_USER.idFromName('glen')
    {
      const storage = await getMiniflareDurableObjectStorage(userId)
      await storage.put('username', 'glen')
    }
    {
      const id = HOLODB_POST.idFromName('1-best-cats')
      const storage = await getMiniflareDurableObjectStorage(id)
      await storage.put('title', 'Best Cats')
      await storage.put('author', userId)
    }
  })

  test('single field', async () => {
    await testGraphql(
      `
        query {
          getPostBySlug(slug: "1-best-cats") {
            title
          }
        }
      `,
      200,
      {
        ok: true,
        errors: [],
        data: {
          getPostBySlug: {
            title: 'Best Cats',
          },
        },
      }
    )
  })
})

test.skip('should pass-through to durable object', async () => {
  const env = getMiniflareBindings()
  const { HOLODB_USER } = env
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
  }).toMatchObject({ ok: true })

  const newValue = await storage.get('count')
  expect(newValue).toBe(11)
})
