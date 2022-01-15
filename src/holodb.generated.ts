export class HoloDB_User implements DurableObject {
  // Store this.state for later access
  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request) {
    return new Response('hi.')
  }
}
