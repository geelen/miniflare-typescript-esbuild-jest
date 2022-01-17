export class HoloDB_User implements DurableObject {
  // Store this.state for later access
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request) {
    const { pathname } = new URL(request.url)
    console.log(pathname)
    if (!(pathname === '/subquery' && request.method === 'POST')) {
      return new Response('Not found', {status: 404})
    }
    const body = await request.text()
    console.log({body})

    return new Response(JSON.stringify({
      email: 'lololol2@three.com!'
    }), {
      headers: {
        'content-type': 'application/json',
      },
    })
  }
}
