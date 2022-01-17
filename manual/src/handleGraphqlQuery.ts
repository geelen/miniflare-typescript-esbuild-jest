import { ApolloServerBase } from 'apollo-server-core'
import { schema } from '@/constants'
import { getBySurrogateKey } from '@/utils'

export async function handleGraphqlQuery(request: Request, env: Bindings) {
  const server = new ApolloServerBase({
    typeDefs: schema,
    resolvers: {
      Query: {
        getUserByUsername: getBySurrogateKey(env.HOLODB_USER),
        getPostBySlug: getBySurrogateKey(env.HOLODB_POST),
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
