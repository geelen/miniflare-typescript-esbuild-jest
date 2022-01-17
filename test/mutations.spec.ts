import { createObject, ctx, testGraphql, updateObject } from './utils'

describe('new User', () => {
  beforeEach(async () => {})

  test('create & retrieve', async () => {
    await testGraphql(
      {
        query: `
        mutation CreateUser($input: UserInput) {
          createUser(input: $input) {
            id
          }
        }
      `,
        variables: {
          $input: {
            hi: 'get fucked',
          },
        },
      },
      200,
      {
        ok: true,
        errors: [],
        data: {
          getUserByUsername: {
            email: 'glen@glen.com',
          },
        },
      }
    )
  })
})
