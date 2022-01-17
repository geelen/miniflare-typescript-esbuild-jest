import { ApolloServerBase } from 'apollo-server-core'
import { schema } from '@/constants'
import { GraphQLResolveInfo, SelectionNode } from 'graphql'

const getBySurrogateKey = (NAMESPACE: DurableObjectNamespace) => async (
  parent: any,
  args: { [k: string]: string },
  ctx: any,
  info: GraphQLResolveInfo
) => {
  const key = Object.values(args)[0]
  const subQueryNodes = info.fieldNodes[0].selectionSet!.selections

  const id = NAMESPACE.idFromName(key)
  const stub = NAMESPACE.get(id)

  const response = await stub.fetch('https://holo.db/subquery', {
    method: 'POST',
    body: JSON.stringify(subQueryNodes),
  })
  return await response.json()
}

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
  const result = await server.executeOperation({
    query: await request.text(),
    variables: {},
  })
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
