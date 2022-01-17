export const schema = `
  type User {
    id: ID!
    username: String
    email: String
    avatar: String
    posts: [Post]
  }
  
  type Post {
    id: ID!
    slug: String
    title: String
    author: User
  }
  
  type Query {
    getUserByUsername(username: String): User
    getUserById(id: ID!): User
    getPostBySlug(slug: String): Post
    getPostById(id: ID!): Post
  }
`
