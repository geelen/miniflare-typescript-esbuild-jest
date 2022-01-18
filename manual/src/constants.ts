export const schema = `
  input UpdateUserInput {
    email: String
    avatar: String
    postsIds: [ID]
  }
  
  input CreateUserInput {
    username: String!
    email: String
    avatar: String
    postsIds: [ID]
  }
  
  type User {
    id: ID!
    createdAt: String!
    updatedAt: String!
    username: String!
    email: String
    avatar: String
    posts: [Post]
  }
  
  input CreatePostInput {
    slug: String!
    title: String
    body: String
    authorId: ID
  }
  
  input UpdatePostInput {
    title: String
    body: String
    authorId: ID
  }
  
  type Post {
    id: ID!
    createdAt: String!
    updatedAt: String!
    slug: String!
    title: String
    body: String
    author: User
  }
  
  type Query {
    getUserById(id: ID!): User
    getUserByUsername(username: String!): User
    getPostById(id: ID!): Post
    getPostBySlug(slug: String!): Post
  }
  
  type Mutation {
    createUser(input: CreateUserInput!): User
    updateUserByUsername(username: String!, input: UpdateUserInput!): User
    updateUserById(id: ID!, input: UpdateUserInput!): User
  
    createPost(input: CreatePostInput!): Post
    updatePostById(id: ID!, input: UpdatePostInput!): Post
    updatePostBySlug(slug: String!, input: UpdatePostInput!): Post
  }
`
