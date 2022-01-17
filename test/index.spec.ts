import worker from '@/index'
import { createObject, ctx, testGraphql, updateObject } from './utils'
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

describe.only('User with Posts', () => {
  beforeEach(async () => {
    const userId = await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
    const post1 = await createObject(
      'HOLODB_POST',
      { slug: '1-best-cats' },
      {
        title: 'Best Cats',
        author: userId,
        body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
      }
    )
    const post2 = await createObject(
      'HOLODB_POST',
      { slug: '2-also-good-animals' },
      {
        title: 'Animals That Are Also Good',
        author: userId,
        body: `# Animals That Are Also Good\n\n* Stevie\n* Buster`,
      }
    )
    const post3 = await createObject(
      'HOLODB_POST',
      { slug: '3-biggest-cat' },
      {
        title: 'Biggest Cat',
        author: userId,
        body: `# Biggest Cat?\n\n* Principles!`,
      }
    )
    await updateObject('HOLODB_USER', userId, {
      posts: [post1, post2, post3],
    })
  })

  test('graph across collection', async () => {
    await testGraphql(
      `
        query {
          getUserByUsername(username: "glen") {
            email
            avatar
            posts {
              title
              slug
            }
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
            posts: [
              {title:'Best Cats', slug:'1-best-cats'},
              {title:'Animals That Are Also Good', slug:'2-also-good-animals'},
              {title:'Biggest Cat', slug:'3-biggest-cat'},
            ]
          },
        },
      }
    )
  })
})
