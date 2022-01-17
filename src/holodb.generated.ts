import { CreateModel } from '@/CreateModel'

export const HoloDB_User = CreateModel(
  {
    createdAt: 'string',
    username: 'string',
    email: 'string',
    avatar: 'string',
  },
  {},
  {
    posts: 'HOLODB_POST',
  }
)

export const HoloDB_Post = CreateModel(
  {
    createdAt: 'string',
    slug: 'string',
    title: 'string',
    body: 'string',
  },
  {
    author: 'HOLODB_USER',
  },
  {}
)
