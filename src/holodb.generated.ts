import { SelectionNode, Kind, FieldNode } from 'graphql'

const isFieldNode = (field: SelectionNode): field is FieldNode =>
  field.kind === Kind.FIELD

const USER_REFS_SINGLE: { [k: string]: string } = {}
const USER_REFS_COLLECTION: { [k: string]: string } = {}

export class HoloDB_User implements DurableObject {
  static PRIMITIVE_FIELDS: { [k: string]: string } = {
    username: 'string',
    email: 'string',
    avatar: 'string',
  }
  statics: typeof HoloDB_User

  // Store this.state for later access
  constructor(
    private readonly state: DurableObjectState,
    private readonly env: Bindings
  ) {
    this.statics = this.constructor as typeof HoloDB_User
  }

  async fetch(request: Request) {
    const { pathname } = new URL(request.url)
    console.log(pathname)
    if (!(pathname === '/subquery' && request.method === 'POST')) {
      return new Response('Not found', { status: 404 })
    }
    const subquery = (await request.json()) as ReadonlyArray<SelectionNode>

    console.log('BINDINGS')
    console.log(this.env)

    const subqueryResponse: any = {}

    for (const field of subquery) {
      if (isFieldNode(field)) {
        const fieldName = field.name.value
        if (this.statics.PRIMITIVE_FIELDS[fieldName]) {
          subqueryResponse[fieldName] = await this.state.storage.get(fieldName)
        } else {
          const myFields = Object.keys(this.statics.PRIMITIVE_FIELDS).join(', ')
          console.log(
            `Query requested '${fieldName}' but we only have the following keys: ${myFields}`
          )
        }
      } else {
        console.log(`HoloDB only supports straight Fields, not ${field.kind}!`)
      }
    }
    console.log({ subquery })

    return new Response(JSON.stringify(subqueryResponse), {
      headers: {
        'content-type': 'application/json',
      },
    })
  }
}