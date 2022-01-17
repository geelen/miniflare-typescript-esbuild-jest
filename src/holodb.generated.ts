import { FieldNode, Kind, SelectionNode } from 'graphql'

const isFieldNode = (field: SelectionNode): field is FieldNode =>
  field.kind === Kind.FIELD

function CreateModel(
  PRIMITIVE_FIELDS: { [k: string]: string },
  USER_REFS_SINGLE: string[],
  USER_REFS_COLLECTION: string[]
) {
  return class HoloDB_Base implements DurableObject {
    // Store this.state for later access
    constructor(
      private readonly state: DurableObjectState,
      private readonly env: Bindings
    ) {}

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
          if (PRIMITIVE_FIELDS[fieldName]) {
            subqueryResponse[fieldName] = await this.state.storage.get(fieldName)
          } else {
            const myFields = Object.keys(PRIMITIVE_FIELDS).join(', ')
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
}

export const HoloDB_User = CreateModel(
  {
    username: 'string',
    email: 'string',
    avatar: 'string',
  },
  [],
  []
)

export const HoloDB_Post = CreateModel(
  {
    title: 'string',
  },
  [],
  []
)
