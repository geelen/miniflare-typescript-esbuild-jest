import worker from '@/index'
import { ctx } from './utils'

test('should redirect to example page on no route match', async () => {
  const env = getMiniflareBindings()
  const res = await worker.fetch(new Request('http://localhost'), env, ctx)
  expect(res.status).toBe(404)
})

/*
*
* class User {
* @surrogate-id
	username: string
	email: string
	avatar: string
	posts: Post[]
}

class Post {
  title: string
  body: string
  author: User
  createdAt: Date
}

* */

test('single object, single field', async () => {
  const env = getMiniflareBindings()
  const { HOLODB_USER } = env
  const id = HOLODB_USER.idFromName('glen')
  const storage = await getMiniflareDurableObjectStorage(id)
  await storage.put('email', 'glen@glen.com')

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
      data: { getUserByUsername: { email: 'glen@glen.com' } },
    },
  ])
})

test.skip('should pass-through to durable object', async () => {
  const env = getMiniflareBindings()
  const { COUNTER, HOLODB_USER } = env
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
