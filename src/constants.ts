export const schema = `
  type User {
    id: ID!
    username: String
    email: String
    avatar: String
    createdAt: String
    posts: [Post]
  }
  
  type Post {
    id: ID!
    slug: String
    title: String
    author: User
    body: String
  }
  
  type Query {
    getUserByUsername(username: String): User
    getUserById(id: ID!): User
    getPostBySlug(slug: String): Post
    getPostById(id: ID!): Post
  }
`
