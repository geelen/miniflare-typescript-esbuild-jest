import {FieldNode, Kind, SelectionNode} from 'graphql'

export const jsonResponse = (data: any, init?: ResponseInit) => {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...init?.headers,
    },
  })
}
export const cachedJson = (data: any, init?: ResponseInit) =>
  jsonResponse(data, {
    ...init,
    headers: {
      'cache-control': 'immutable',
      ...init?.headers,
    },
  })

export const isFieldNode = (field: SelectionNode): field is FieldNode =>
  field.kind === Kind.FIELD

export const fieldNames = (fields: ReadonlyArray<SelectionNode>) =>
  fields.filter(isFieldNode).map((f) => f.name.value)

export function isTruthy<T>(x: T | undefined): x is T {
  return Boolean(x)
}
