import {SelectionNode} from "graphql";

export type CreateBody = {
  id: string
  payload: { [k:string]: any }
  subquery: ReadonlyArray<SelectionNode>
}
