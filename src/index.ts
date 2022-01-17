type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
import { ApolloServerBase } from 'apollo-server-core'

async function handleGraphqlQuery(request: Request, env: Bindings) {
  const server = new ApolloServerBase({
    typeDefs: `
type User {
  id: ID!
  username: String
  email: String
  posts: [Post]
}

type Post {
  id: ID!
  title: String
  author: User
}

type Query {
  getUserByUsername(username: String): User
  getUserById(id: ID!): User
}
`,
    resolvers: {
      Query: {
        getUserByUsername: async (parent, { username }, ctx, info) => {
          console.log(username)
          // console.log(info)
          // console.log(info.fieldNodes[0].arguments![0])
          const subQueryNodes = info.fieldNodes[0].selectionSet!.selections
          console.log({subQueryNodes})

          const { HOLODB_USER } = env
          const id = HOLODB_USER.idFromName(username)
          const stub = HOLODB_USER.get(id)
          const body2 = JSON.stringify(subQueryNodes);
          console.log({body2})
          const response = await stub.fetch('https://holo.db/subquery', {
            method: 'POST',
            body: body2
          })
          console.log({response})
          const body = await response.json()
          console.log({body})
          return body
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
      status: 400
    })
  } else {
    return new Response(JSON.stringify({ ok: true, errors: [], data }), {
      headers: {
        'content-type': 'application/json',
      },
    })
  }
}

const worker: WithRequired<ExportedHandler<Bindings>, 'fetch'> = {
  fetch: async function (request: Request, env: Bindings) {
    // Match route against pattern /:name/*action
    const { pathname } = new URL(request.url)
    if (pathname === '/graphql' && request.method === 'POST') {
      return handleGraphqlQuery(request, env)
    } else {
      return new Response('Not found', { status: 404 })
    }

    // const match = /\/(?<name>[^/]+)(?<action>.*)/.exec(url.pathname)
    // if (!match?.groups) {
    //   // If we didn't specify a name, default to "test"
    //   return Response.redirect(`${url.origin}/test/increment`, 302)
    // }
    //
    // // Forward the request to the named Durable Object...
    // const { COUNTER } = env
    // const id = COUNTER.idFromName(match.groups.name)
    // const stub = COUNTER.get(id)
    // // ...removing the name prefix from URL
    // url.pathname = match.groups.action
    // return stub.fetch(url.toString())
  },
}

// Make sure we export the Counter Durable Object class
export { Counter } from './counter'
export { HoloDB_User } from './holodb.generated'
export default worker
