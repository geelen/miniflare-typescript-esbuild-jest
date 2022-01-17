import { FieldNode, Kind, SelectionNode } from 'graphql'
import { fetchSubquery } from '@/utils'
import { CreateBody } from '@/types'

const isFieldNode = (field: SelectionNode): field is FieldNode =>
  field.kind === Kind.FIELD

export function CreateModel(
  PRIMITIVE_FIELDS: { [k: string]: string },
  SINGLE_REF_FIELDS: { [k: string]: keyof Bindings },
  COLLECTION_REF_FIELDS: { [k: string]: keyof Bindings }
) {
  return class HoloDB_Base implements DurableObject {
    // Store this.state for later access
    constructor(
      private readonly state: DurableObjectState,
      private readonly env: Bindings
    ) {
    }

    async fetch(request: Request) {
      const { pathname } = new URL(request.url)
      if (pathname === '/subquery' && request.method === 'POST') {
        return await this.subquery((await request.json()) as ReadonlyArray<SelectionNode>)
      } else if (pathname === '/create' && request.method === 'POST') {
        return await this.createFrom((await request.json()) as CreateBody)
      } else {
        return new Response('Not found', { status: 404 })
      }
    }

    async subquery(selection: ReadonlyArray<SelectionNode>) {
      const subqueryResponse: any = {}
      await Promise.all(
        selection.map(async (field) => {
          if (isFieldNode(field)) {
            const fieldName = field.name.value
            if (PRIMITIVE_FIELDS[fieldName]) {
              subqueryResponse[fieldName] = await this.state.storage.get(fieldName)
            } else if (SINGLE_REF_FIELDS[fieldName]) {
              if (field.selectionSet) {
                const NAMESPACE = this.env[SINGLE_REF_FIELDS[fieldName]]
                const refId = (await this.state.storage.get(fieldName)) as string
                subqueryResponse[fieldName] = await fetchSubquery(
                  NAMESPACE,
                  refId,
                  field.selectionSet.selections
                )
              } else {
                console.log(
                  `Query requested reference to '${fieldName}' but didn't specify any selection fields!`
                )
              }
            } else if (COLLECTION_REF_FIELDS[fieldName]) {
              if (field.selectionSet) {
                const NAMESPACE = this.env[COLLECTION_REF_FIELDS[fieldName]]
                const fields = field.selectionSet.selections
                const refs = (await this.state.storage.get(fieldName)) as string[]
                subqueryResponse[fieldName] = await Promise.all(
                  refs.map(async (refId) => {
                    return await fetchSubquery(NAMESPACE, refId, fields)
                  })
                )
              } else {
                console.log(
                  `Query requested reference to '${fieldName}' but didn't specify any selection fields!`
                )
              }
            } else {
              const myFields = Object.keys(PRIMITIVE_FIELDS).join(', ')
              console.log(
                `Query requested '${fieldName}' but we only have the following keys: ${myFields}`
              )
            }
          } else {
            console.log(`HoloDB only supports straight Fields, not ${field.kind}!`)
          }
        })
      )
      return new Response(JSON.stringify(subqueryResponse), {
        headers: {
          'content-type': 'application/json',
        },
      })
    }

    async createFrom({ id, payload, subquery }: CreateBody) {
      const { storage } = this.state
      storage.put('id', id)
      storage.put('createdAt', new Date().toJSON())
      for (const [k, v] of Object.entries(payload)) {
        storage.put(k, v)
      }

      return this.subquery(subquery)
    }
  }
}
