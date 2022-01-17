import { handleGraphqlQuery } from '@/handleGraphqlQuery'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const worker: WithRequired<ExportedHandler<Bindings>, 'fetch'> = {
  fetch: async function (request: Request, env: Bindings) {
    // Match route against pattern /:name/*action
    const { pathname } = new URL(request.url)
    if (pathname === '/graphql' && request.method === 'POST') {
      try {
        return handleGraphqlQuery(request, env)
      } catch (e: any) {
        return new Response(JSON.stringify([e.message, e.stack]), {
          status: 500,
          headers: {
            'content-type': 'application/json',
          },
        })
      }
    } else {
      return new Response('Not found', { status: 404 })
    }
  },
}

export { HoloDB_User, HoloDB_Post } from './holodb.generated'
export default worker
