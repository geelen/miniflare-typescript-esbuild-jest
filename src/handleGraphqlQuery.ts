import { ApolloServerBase } from 'apollo-server-core'
import { schema } from '@/constants'
import {createWithSurrogateKey, getById, getBySurrogateKey, updateById, updateBySurrogateKey} from "@/resolvers";

export async function handleGraphqlQuery(request: Request, env: Bindings) {
  const server = new ApolloServerBase({
    typeDefs: schema,
    resolvers: {
      Query: {
        getUserById: getById(env.HOLODB_USER),
        getUserByUsername: getBySurrogateKey(env.HOLODB_USER, 'username'),
        getPostById: getById(env.HOLODB_POST),
        getPostBySlug: getBySurrogateKey(env.HOLODB_POST, 'slug'),
      },
      Mutation: {
        createUser: createWithSurrogateKey(env.HOLODB_USER, 'username'),
        updateUserById: updateById(env.HOLODB_USER),
        updateUserByUsername: updateBySurrogateKey(env.HOLODB_USER, 'username'),
        createPost: createWithSurrogateKey(env.HOLODB_POST, 'slug'),
        updatePostById: updateById(env.HOLODB_POST),
        updatePostBySlug: updateBySurrogateKey(env.HOLODB_POST, 'slug'),
      },
    },
  })
  const result = await server.executeOperation(await request.json())
  const { errors, data } = result

  if (errors) {
    return new Response(JSON.stringify({ ok: false, errors }), {
      headers: {
        'content-type': 'application/json',
      },
      status: 400,
    })
  } else {
    return new Response(JSON.stringify({ ok: true, errors: [], data }), {
      headers: {
        'content-type': 'application/json',
      },
    })
  }
}
