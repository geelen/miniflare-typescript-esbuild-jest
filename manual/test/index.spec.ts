import {
  createObject,
  ctx,
  testGraphql,
  testGraphqlOK,
  testTqlOK,
  updateObject,
} from './utils'
import { query } from '../schema.tql'

describe.only('skip all tests', () => {
  test('x', () => {})
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
    await testGraphqlOK(
      `
        query {
          getUserByUsername(username: "glen") {
            email
          }
        }
      `,
      {},
      {
        getUserByUsername: {
          email: 'glen@glen.com',
        },
      }
    )
  })

  test('two fields', async () => {
    await testGraphqlOK(
      `
        query {
          getUserByUsername(username: "glen") {
            email
            avatar
            createdAt            
          }
        }
      `,
      {},
      {
        getUserByUsername: {
          email: 'glen@glen.com',
          avatar: 'https://www.fillmurray.com/200/200',
          createdAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
          ),
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
        authorId: userId,
        body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
      }
    )
  })

  test('single field', async () => {
    await testGraphqlOK(
      `
        query {
          getPostBySlug(slug: "1-best-cats") {
            title
          }
        }
      `,
      {},
      {
        getPostBySlug: {
          title: 'Best Cats',
        },
      }
    )
  })

  test('single ref', async () => {
    await testTqlOK(
      query('', (t) => [
        t.getPostBySlug({ slug: '1-best-cats' }, (t) => [
          t.title(),
          t.author((t) => [t.username()]),
        ]),
      ]),
      {
        getPostBySlug: {
          title: 'Best Cats',
          author: {
            username: 'glen',
          },
        },
      }
    )
  })

  test('more fields', async () => {
    await testTqlOK(
      query('', (t) => [
        t.getPostBySlug({ slug: '1-best-cats' }, (t) => [
          t.title(),
          t.slug(),
          t.body(),
          t.author((t) => [t.username(), t.email(), t.avatar()]),
        ]),
      ]),
      {
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
      }
    )
  })
})

describe('User with Posts', () => {
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
        authorId: userId,
        body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
      }
    )
    const post2 = await createObject(
      'HOLODB_POST',
      { slug: '2-also-good-animals' },
      {
        title: 'Animals That Are Also Good',
        authorId: userId,
        body: `# Animals That Are Also Good\n\n* Stevie\n* Buster`,
      }
    )
    const post3 = await createObject(
      'HOLODB_POST',
      { slug: '3-biggest-cat' },
      {
        title: 'Biggest Cat',
        authorId: userId,
        body: `# Biggest Cat?\n\n* Principles!`,
      }
    )
    await updateObject('HOLODB_USER', userId, {
      postsIds: [post1, post2, post3],
    })
  })

  test('graph across collection', async () => {
    await testTqlOK(
      query('', (t) => [
        t.getUserByUsername({ username: 'glen' }, (t) => [
          t.email(),
          t.avatar(),
          t.posts((t) => [t.title(), t.slug()]),
        ]),
      ]),
      {
        getUserByUsername: {
          email: 'glen@glen.com',
          avatar: 'https://www.fillmurray.com/200/200',
          posts: [
            { title: 'Best Cats', slug: '1-best-cats' },
            { title: 'Animals That Are Also Good', slug: '2-also-good-animals' },
            { title: 'Biggest Cat', slug: '3-biggest-cat' },
          ],
        },
      }
    )
  })
})

describe('Edge cases', () => {
  it(`Shouldn't crawl collection if only fetching IDs`, async () => {
    const userId = await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      {
        email: 'glen@glen.com',
        avatar: 'https://www.fillmurray.com/200/200',
        postsIds: ['no-existo1', 'no-existo2', 'no-existo3'],
      }
    )

    await testGraphqlOK(
      `
        query($id: ID!) {
          getUserById(id: $id) {
            username
            posts {
              id
            }
          }
        }
      `,
      { id: userId },
      {
        getUserById: {
          username: `glen`,
          posts: [{ id: 'no-existo1' }, { id: 'no-existo2' }, { id: 'no-existo3' }],
        },
      }
    )
  })

  it(`Shouldn't crawl ref if only fetching ID`, async () => {
    const postId = await createObject(
      'HOLODB_POST',
      { slug: '1-best-cats' },
      {
        title: 'Best Cats',
        authorId: `this-user-doesnt-exist`,
        body: `# The World's Best Cats\n\n* Principles\n* Whitney`,
      }
    )

    await testGraphqlOK(
      `
        query($id: ID!) {
          getPostById(id: $id) {
            slug
            author {
              id
            }
          }
        }
      `,
      { id: postId },
      {
        getPostById: {
          slug: `1-best-cats`,
          author: {
            id: `this-user-doesnt-exist`,
          },
        },
      }
    )
  })
})
