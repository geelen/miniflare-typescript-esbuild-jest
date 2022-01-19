import { CreateModel } from '@/CreateModel'

export const HoloDB_User = CreateModel(
  'User',
  {
    id: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    username: 'string',
    email: 'string',
    avatar: 'string',
    postsIds: 'string[]'
  },
  {},
  {
    posts: 'HOLODB_POST',
  }
)

export const HoloDB_Post = CreateModel(
  'Post',
  {
    id: 'string',
    createdAt: 'string',
    updatedAt: 'string',
    slug: 'string',
    title: 'string',
    body: 'string',
    authorId: 'string'
  },
  {
    author: 'HOLODB_USER',
  },
  {}
)
