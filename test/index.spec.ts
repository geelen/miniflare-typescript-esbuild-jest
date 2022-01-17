import worker from '@/index'
import { createObject, ctx, testGraphql } from './utils'
// @ts-ignore
import mapValuesDeep from 'map-values-deep'

test('should redirect to example page on no route match', async () => {
  const env = getMiniflareBindings()
  const res = await worker.fetch(new Request('http://localhost'), env, ctx)
  expect(res.status).toBe(404)
})

describe('single User', () => {
  beforeEach(async () => {
    await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
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
    const userId = await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
    await createObject(
      'HOLODB_POST',
      { slug: '1-best-cats' },
      {
        title: 'Best Cats',
        author: userId,
        body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
      }
    )
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

  test('single ref', async () => {
    await testGraphql(
      `
        query {
          getPostBySlug(slug: "1-best-cats") {
            title
            author {
              username
            }
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
            author: {
              username: 'glen',
            },
          },
        },
      }
    )
  })

  test('more fields', async () => {
    await testGraphql(
      `
        query {
          getPostBySlug(slug: "1-best-cats") {
            title
            slug
            body
            author {
              username
              email
              avatar
            }
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
            slug: '1-best-cats',
            body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
            author: {
              username: 'glen',
              email: 'glen@glen.com',
              avatar: 'https://www.fillmurray.com/200/200',
            },
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
