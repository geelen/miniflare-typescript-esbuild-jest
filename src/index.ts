type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
import { ApolloServerBase } from 'apollo-server-core'

async function handleGraphqlQuery(request: Request) {
  const server = new ApolloServerBase({
    typeDefs: `
type User {
  id: ID!
  username: String
  email: String
}

type Query {
  getUserByUsername(username: String): User
  getUserById(id: ID!): User
}
`,
    resolvers: {
      Query: {
        getUserByUsername: (...args) => {
          console.log({ args })
          return {
            email: 'yeah@nah.org',
          }
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
    return new Response(JSON.stringify({ ok: true, data }), {
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
      return handleGraphqlQuery(request)
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
