
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }

const worker: WithRequired<ExportedHandler<Bindings>, 'fetch'> = {
  fetch: async function (request: Request, env: Bindings) {
    // Match route against pattern /:name/*action
    const url = new URL(request.url)
    const match = /\/(?<name>[^/]+)(?<action>.*)/.exec(url.pathname)
    if (!match?.groups) {
      // If we didn't specify a name, default to "test"
      return Response.redirect(`${url.origin}/test/increment`, 302)
    }

    // Forward the request to the named Durable Object...
    const { COUNTER } = env
    const id = COUNTER.idFromName(match.groups.name)
    const stub = COUNTER.get(id)
    // ...removing the name prefix from URL
    url.pathname = match.groups.action
    return stub.fetch(url.toString())
  },
}

// Make sure we export the Counter Durable Object class
export { Counter } from './counter'
export default worker
