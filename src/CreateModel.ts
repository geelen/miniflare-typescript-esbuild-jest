import { SelectionNode } from 'graphql'
import { isFieldNode, jsonResponse } from '@/utils'
import {CreateBody, ResolverContext, UpdateBody, UpdateResponse} from '@/types'
import { fetchSubquery } from '@/fetchSubquery'

function onlyFetchingId(fields: ReadonlyArray<SelectionNode>) {
  if (fields.length !== 1) return false
  return isFieldNode(fields[0]) && fields[0].name.value === 'id'
}

export function CreateModel(
  name: string,
  PRIMITIVE_FIELDS: { [k: string]: string },
  SINGLE_REF_FIELDS: { [k: string]: keyof Bindings },
  COLLECTION_REF_FIELDS: { [k: string]: keyof Bindings }
) {
  // This gives us a named element in the stack trace
  const fetcherName = `fetch${name}`

  return class HoloModel implements DurableObject {
    // Store this.state for later access
    constructor(
      private readonly state: DurableObjectState,
      private readonly env: Bindings
    ) {}

    async fetch(request: Request) {
      // Todo: find a better way to get Model names in stack traces...
      // @ts-ignore
      return this[fetcherName](request)
    }

    async [fetcherName](request: Request) {
      const { pathname } = new URL(request.url)
      if (pathname === '/subquery' && request.method === 'POST') {
        return await this.subquery((await request.json()) as ReadonlyArray<SelectionNode>)
      } else if (pathname === '/create' && request.method === 'POST') {
        return await this.createFrom((await request.json()) as CreateBody)
      } else if (pathname === '/update' && request.method === 'POST') {
        return await this.updateFrom((await request.json()) as UpdateBody)
      } else {
        return new Response('Not found', { status: 404 })
      }
    }

    async subquery(selection: ReadonlyArray<SelectionNode>) {
      // Never allow an un-created Object to be queried
      const myId = await this.state.storage.get('id')
      if (myId === undefined)
        return jsonResponse(
          {},
          {
            status: 404,
          }
        )

      return jsonResponse(await this.doSubquery(selection))
    }

    private async doSubquery(selection: ReadonlyArray<SelectionNode>) {
      const { storage } = this.state
      const ctx: ResolverContext = { cacheTraces: [] }
      const subqueryResponse: any = {}
      await Promise.all(
        selection.map(async (field) => {
          if (isFieldNode(field)) {
            const fieldName = field.name.value
            if (PRIMITIVE_FIELDS[fieldName]) {
              subqueryResponse[fieldName] = await storage.get(fieldName)
            } else if (SINGLE_REF_FIELDS[fieldName]) {
              if (field.selectionSet) {
                const fields = field.selectionSet.selections
                const id = (await storage.get(fieldName + 'Id')) as string
                // Special case when only requesting { id } from the reference
                if (id !== undefined) {
                  if (onlyFetchingId(fields)) {
                    subqueryResponse[fieldName] = { id }
                  } else {
                    const NAMESPACE = this.env[SINGLE_REF_FIELDS[fieldName]]
                    subqueryResponse[fieldName] = await fetchSubquery(
                      ctx,
                      NAMESPACE,
                      { id },
                      fields
                    )
                  }
                }
              } else {
                console.log(
                  `Query requested reference to '${fieldName}' but didn't specify any selection fields!`
                )
              }
            } else if (COLLECTION_REF_FIELDS[fieldName]) {
              if (field.selectionSet) {
                const fields = field.selectionSet.selections
                const refs = ((await storage.get(fieldName + 'Ids')) || []) as string[]
                // Special case when only requesting { id } from the reference
                if (onlyFetchingId(fields)) {
                  subqueryResponse[fieldName] = refs.map((ref) => ({ id: ref }))
                } else {
                  const NAMESPACE = this.env[COLLECTION_REF_FIELDS[fieldName]]
                  subqueryResponse[fieldName] = await Promise.all(
                    refs.map(async (id) => {
                      return await fetchSubquery(ctx, NAMESPACE, { id }, fields)
                    })
                  )
                }
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
      return subqueryResponse
    }

    async createFrom({ id, payload, subquery }: CreateBody) {
      const { storage } = this.state

      // Only allow an Object to be created once
      if ((await storage.get('id')) !== undefined) return jsonResponse({})
      storage.put('id', id)

      const now = new Date().toJSON()
      storage.put('createdAt', now)
      storage.put('updatedAt', now)
      for (const [k, v] of Object.entries(payload)) {
        storage.put(k, v)
      }

      return jsonResponse(await this.doSubquery(subquery))
    }

    async updateFrom({ payload, subquery }: UpdateBody) {
      const { storage } = this.state

      // Only allow updates on Objects that have been created
      if ((await storage.get('id')) === undefined) return jsonResponse({})

      const updates: Record<string, any> = {
        'updatedAt': new Date().toJSON(),
        ...payload
      }

      for (const [k, v] of Object.entries(updates)) {
        storage.put(k, v)
      }

      const response: UpdateResponse = {
        subquery: await this.doSubquery(subquery),
        updates,
        invalidations: []
      };
      return jsonResponse(response)
    }
  }
}
