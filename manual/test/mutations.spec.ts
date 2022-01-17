import { createObject, ctx, testGraphql, updateObject } from './utils'
import {getById} from "@/utils";

describe('new User', () => {
  beforeEach(async () => {})

  test('create & retrieve', async () => {
    const response = await testGraphql(
      {
        query: `
        mutation CreateUser($input: UserInput) {
          createUser(input: $input) {
            id
          }
        }
      `,
        variables: {
          input: {
            username: 'geelen',
            email: 'graphql@created.com',
          },
        },
      },
      200,
      {
        ok: true,
        errors: [],
        data: {
          createUser: {
            id: expect.stringMatching(/^[a-z0-9]{64}$/),
          },
        },
      }
    )
    const { id } = response.data.createUser

    await testGraphql(
      `
        query {
          getUserByUsername(username: "geelen") {
            id
          }
        }
      `,
      200,
      {
        ok: true,
        errors: [],
        data: {
          getUserByUsername: {
            id
          },
        },
      }
    )

    await testGraphql(
      `
        query {
          getUserById(id: "${id}") {
            email
          }
        }
      `,
      200,
      {
        ok: true,
        errors: [],
        data: {
          getUserById: {
            email: 'graphql@created.com',
          },
        },
      }
    )
  })
})
