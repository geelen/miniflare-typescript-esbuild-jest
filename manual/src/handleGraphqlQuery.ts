import { ApolloServerBase } from 'apollo-server-core'
import { schema } from '@/constants'
import { SelectionNode } from 'graphql'

export async function handleGraphqlQuery(request: Request, env: Bindings) {
  const server = new ApolloServerBase({
    typeDefs: schema,
    resolvers: {
      Query: {
        getUserByUsername: async (parent, { username }, ctx, info) => {
          console.log(username)
          // console.log(info)
          // console.log(info.fieldNodes[0].arguments![0])
          const subQueryNodes = info.fieldNodes[0].selectionSet!.selections
          console.log({ subQueryNodes })

          const { HOLODB_USER } = env
          const id = HOLODB_USER.idFromName(username)
          const stub = HOLODB_USER.get(id)

          const response = await stub.fetch('https://holo.db/subquery', {
            method: 'POST',
            body: JSON.stringify(subQueryNodes),
          })
          return await response.json()
        },
      },
    },
  })
  const result = await server.executeOperation({
    query: await request.text(),
    variables: {},
  })
  console.log(result)
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
