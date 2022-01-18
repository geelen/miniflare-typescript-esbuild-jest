import { testGraphqlOK } from './utils'
import { PostInput, UserInput } from '@/types'

export async function createUser(user: UserInput) {
  const response = await testGraphqlOK(
    `
      mutation CreateUser($input: UserInput) {
        createUser(input: $input) {
          id
        }
      }
    `,
    {
      input: user,
    },
    {
      createUser: {
        id: expect.stringMatching(/^[a-z0-9]{64}$/),
      },
    }
  )
  return response.data.createUser.id
}

export async function createPost(post: PostInput) {
  const response = await testGraphqlOK(
    `
      mutation CreatePost($input: PostInput) {
        createPost(input: $input) {
          id
        }
      }
    `,
    {
      input: post,
    },
    {
      createPost: {
        id: expect.stringMatching(/^[a-z0-9]{64}$/),
      },
    }
  )
  return response.data.createPost.id
}

describe('new User', () => {
  test('create & retrieve', async () => {
    const id = await createUser({
      username: 'geelen',
      email: 'graphql@created.com',
    })

    await testGraphqlOK(
      `
        query {
          getUserByUsername(username: "geelen") {
            id
          }
        }
      `,
      {},
      {
        getUserByUsername: {
          id,
        },
      }
    )

    await testGraphqlOK(
      `
        query {
          getUserById(id: "${id}") {
            email
          }
        }
      `,
      {},
      {
        getUserById: {
          email: 'graphql@created.com',
        },
      }
    )
  })
})

describe.skip('new User & Post', () => {
  test('create & retrieve', async () => {
    const userId = await createUser({
      username: 'mr-post',
      email: 'graphql@created.com',
    })
    const postId = await createPost({
      authorId: userId,
      body: `Which cat is best? My cat.`,
      slug: `1-which-cat-is-best`,
      title: `Which Cat is Best?`
    })

    await testGraphqlOK(
      `
        query {
          getPostBySlug(slug: "1-which-cat-is-best") {
            id
          }
        }
      `,
      {},
      {
        getPostBySlug: {
          id: postId,
        },
      }
    )

    await testGraphqlOK(
      `
        query {
          getPostById(id: "${postId}") {
            title
            author {
              username
            }
          }
        }
      `,
      {},
      {
        getPostById: {
          title: `Which Cat is Best?`,
          author: {
            username: 'mr-post'
          }
        },
      }
    )
    await testGraphqlOK(
      `
        query {
          getUserById(id: "${userId}") {
            username
            posts {
              id
              slug
            }
          }
        }
      `,
      {},
      {
        getPostById: {
          title: `Which Cat is Best?`,
          author: {
            username: 'mr-post'
          }
        },
      }
    )

    await testGraphqlOK(
      `
        mutation {
          updateUserById(id: "${userId}") {
            title
            author {
              username
            }
          }
        }
      `,
      {},
      {
        updateUserById: {
          title: `Which Cat is Best?`,
          author: {
            username: 'mr-post'
          }
        },
      }
    )
  })
})
