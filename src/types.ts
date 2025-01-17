import {SelectionNode} from "graphql";

export type CreateBody = {
  id: string
  payload: { [k:string]: any }
  subquery: ReadonlyArray<SelectionNode>
}

export type UpdateBody = {
  payload: { [k:string]: any }
  subquery: ReadonlyArray<SelectionNode>
}

// Needs to be generated
export type UserInput = {
  username: string
  email?: string
  avatar?: string
}

export type PostInput = {
  slug: string
  title?: string
  body?: string
  authorId?: string
}

export type ResolverContext = {
  cacheTraces: string[]
}
export type DoIdentifier = { id: string } | { name: string }

export type UpdateResponse = {
  subquery: Record<string, any>
  updates: Record<string, any>
  invalidations: string[]
};
