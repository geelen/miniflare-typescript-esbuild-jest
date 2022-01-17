import { createObject, ctx, testGraphql, updateObject } from './utils'

describe('single User', () => {
  beforeEach(async () => {
  })

  test.skip('single field', async () => {
    await testGraphql(
      `
        query {
          getUserByUsername(username: "glen") {
            email
          }
        }
      `,
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
