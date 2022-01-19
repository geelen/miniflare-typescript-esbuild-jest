import { testGraphqlOK } from './utils'
import { PostInput, UserInput } from '@/types'

describe.only('skip all tests', () => {
  test('x', () => {})
})

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

describe('new User & Post', () => {
  test('create & retrieve', async () => {
    const userId = await createUser({
      username: 'mr-post',
      email: 'graphql@created.com',
    })
    const postId = await createPost({
      authorId: userId,
      body: `Which cat is best? My cat.`,
      slug: `1-which-cat-is-best`,
      title: `Which Cat is Best?`,
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
            username: 'mr-post',
          },
        },
      }
    )
  })

  test('updating IDs', async () => {
    const userId = await createUser({
      username: 'mr-post',
      email: 'graphql@created.com',
    })
    const postId = await createPost({
      body: `Which cat is best? My cat.`,
      slug: `1-which-cat-is-best`,
      title: `Which Cat is Best?`,
    })

    // Expecting no posts yet, since we haven't updated!
    const getUserPosts = `
      query($id: ID!) {
        getUserById(id: $id) {
          username
          posts {
            id
            slug
          }
        }
      }
    `
    await testGraphqlOK(
      getUserPosts,
      { id: userId },
      {
        getUserById: {
          username: 'mr-post',
          posts: [],
        },
      }
    )

    await testGraphqlOK(
      `
        mutation($id: ID!, $input: UpdateUserInput!) {
          updateUserById(id: $id, input: $input) {
            username
            posts {
              id
            }
          }
        }
      `,
      {
        id: userId,
        input: {
          postsIds: [postId],
        },
      },
      {
        updateUserById: {
          username: 'mr-post',
          posts: [{ id: postId }],
        },
      }
    )

    // Now we should see posts!
    await testGraphqlOK(
      getUserPosts,
      { id: userId },
      {
        getUserById: {
          username: 'mr-post',
          posts: [
            {
              id: postId,
              slug: '1-which-cat-is-best',
            },
          ],
        },
      }
    )

    // Likewise, we haven't set the Author on the Post
    await testGraphqlOK(
      `
        query($slug: String!) {
          getPostBySlug(slug: $slug) {
            title
            author {
              username
            }
          }
        }
      `,
      { slug: '1-which-cat-is-best' },
      {
        getPostBySlug: {
          title: 'Which Cat is Best?',
          author: '<null>', // Had to hack null to '<null>' in the comparator, Jest is weird.
        },
      }
    )

    await testGraphqlOK(
      `
        mutation($slug: String!, $input: UpdatePostInput!) {
          updatePostBySlug(slug: $slug, input: $input) {
            title
            author {
              id
            }
          }
        }
      `,
      {
        slug: '1-which-cat-is-best',
        input: {
          authorId: userId,
        },
      },
      {
        updatePostBySlug: {
          title: 'Which Cat is Best?',
          author: {
            id: userId,
          },
        },
      }
    )

    await testGraphqlOK(
      `
        query($slug: String!) {
          getPostBySlug(slug: $slug) {
            title
            author {
              username
            }
          }
        }
      `,
      { slug: '1-which-cat-is-best' },
      {
        getPostBySlug: {
          title: 'Which Cat is Best?',
          author: {
            username: 'mr-post',
          },
        },
      }
    )
  })
})

export async function createUser(user: UserInput) {
  const response = await testGraphqlOK<{
    createUser: {
      id: string
    }
  }>(
    `
      mutation CreateUser($input: CreateUserInput!) {
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
      mutation CreatePost($input: CreatePostInput!) {
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
