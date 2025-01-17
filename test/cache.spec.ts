import { createObject, testGraphqlOK, testTqlOK } from './utils'
import { mutation, query } from '../schema.tql'
import { cachedJson, jsonResponse } from '@/utils'
import { createPost, createUser } from './references.spec'

describe('single User', () => {
  let userId: string
  beforeEach(async () => {
    userId = await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
  })

  test('single precached field', async () => {
    const cache = await caches.open(`holodb:edge`)
    await cache.put(`https://holo.db/${userId}/avatar`, cachedJson('OMFG HAX'))

    await testTqlOK(
      query('', (t) => [
        t.getUserByUsername({ username: 'glen' }, (t) => [t.email(), t.avatar()]),
      ]),
      {
        getUserByUsername: {
          email: 'glen@glen.com',
          avatar: 'OMFG HAX',
        },
      },
      [`${userId}/email MISS`, `${userId}/avatar HIT`]
    )
  })

  test('re-reading same field', async () => {
    await testTqlOK(
      query('', (t) => [
        t.getUserById(
          {
            id: userId,
          },
          (t) => [t.username()]
        ),
      ]),
      {
        getUserById: {
          username: 'glen',
        },
      },
      [`${userId}/username MISS`]
    )

    await testTqlOK(
      query('', (t) => [
        t.getUserById(
          {
            id: userId,
          },
          (t) => [t.username(), t.email()]
        ),
      ]),
      {
        getUserById: {
          username: 'glen',
          email: 'glen@glen.com',
        },
      },
      [`${userId}/username HIT`, `${userId}/email MISS`]
    )
  })

  test('updating a field', async () => {
    await testGraphqlOK(
      `
        mutation($id: ID!, $input: UpdateUserInput!) {
          updateUserById(id: $id, input: $input) {
            username
            email
          }
        }
      `,
      {
        id: userId,
        input: {
          email: 'new@email.com',
        },
      },
      {
        updateUserById: {
          username: 'glen',
          email: 'new@email.com',
        },
      },
      [`${userId}/username UPDATE`, `${userId}/email UPDATE`]
    )

    await testTqlOK(
      query('', (t) => [t.getUserById({ id: userId }, (t) => [t.username(), t.email()])]),
      {
        getUserById: {
          username: 'glen',
          email: 'new@email.com',
        },
      },
      [`${userId}/username HIT`, `${userId}/email HIT`]
    )
  })

  test(`what if we don't read the field back??`, async () => {
    // Populate the cache
    await testTqlOK(
      query('', (t) => [t.getUserById({ id: userId }, (t) => [t.username(), t.email()])]),
      {
        getUserById: {
          username: 'glen',
          email: 'glen@glen.com',
        },
      },
      [`${userId}/username MISS`, `${userId}/email MISS`]
    )

    // Update Email but only read Username
    await testGraphqlOK(
      `
        mutation($id: ID!, $input: UpdateUserInput!) {
          updateUserById(id: $id, input: $input) {
            username
          }
        }
      `,
      {
        id: userId,
        input: {
          email: 'new@email.com',
        },
      },
      {
        updateUserById: {
          username: 'glen',
        },
      },
      [`${userId}/updatedAt UPDATE`, `${userId}/email UPDATE`]
    )

    // Reading again should give us the new (already cached) data
    await testTqlOK(
      query('', (t) => [t.getUserById({ id: userId }, (t) => [t.username(), t.email()])]),
      {
        getUserById: {
          username: 'glen',
          email: 'new@email.com',
        },
      },
      [`${userId}/username HIT`, `${userId}/email HIT`]
    )
  })

  describe.only('User & Posts', () => {
    let user1: string, user2: string, post1: string, post2: string

    beforeEach(async () => {
      user1 = await createObject(
        'HOLODB_USER',
        { username: 'glen' },
        { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
      )
      user2 = await createObject(
        'HOLODB_USER',
        { username: 'prince' },
        { email: 'prince@prince.com' }
      )
      post1 = await createObject(
        'HOLODB_POST',
        { slug: '1-best-cats' },
        {
          title: 'Best Cats',
          body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
        }
      )
      post2 = await createObject(
        'HOLODB_POST',
        { slug: '2-also-good-animals' },
        {
          title: 'Animals That Are Also Good',
          body: `# Animals That Are Also Good\n\n* Stevie\n* Buster`,
        }
      )
    })

    test(`mutating single references`, async () => {
      // Fetch the null author
      await testTqlOK(
        query('', (t) => [
          t.getPostById({ id: post1 }, (t) => [
            t.slug(),
            t.author((t) => [t.username()]),
          ]),
        ]),
        {
          getPostById: {
            slug: '1-best-cats',
            // @ts-ignore gotta fix that Jest bug with comparing nulls...
            author: '<null>',
          },
        },
        [`${post1}/slug MISS`, `${post1}/author/username MISS`]
      )

      // Update authorId and read the join
      await testGraphqlOK(
        `
          mutation($id: ID!, $input: UpdatePostInput!) {
            updatePostById(id: $id, input: $input) {
              author {
                username
              }
            }
          }
        `,
        {
          id: post1,
          input: {
            authorId: user1,
          }
        },
        {
          updatePostById: {
            author: {
              username: 'glen',
            },
          },
        },
        [`${post1}/updatedAt UPDATE`, `${post1}/author INVALIDATE`]
      )
    })
  })
})
