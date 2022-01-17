export const schema = `
  input UserInput {
    username: String!
    email: String
    avatar: String
  }
  
  type User {
    id: ID!
    createdAt: String!
    username: String!
    email: String
    avatar: String
    posts: [Post]
  }
  
  input PostInput {
    slug: String!
    title: String
    body: String
  }
  
  type Post {
    id: ID!
    createdAt: String!
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
    createUser(input: UserInput): User
    updateUser(input: UserInput): User
    createPost(input: PostInput): Post
    updatePost(input: PostInput): Post
  }
`
