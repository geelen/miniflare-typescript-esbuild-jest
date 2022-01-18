import { createObject, testGraphql, testGraphqlOK } from './utils'

describe('single User', () => {
  beforeEach(async () => {
    await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
  })

  test('single field', async () => {
    await testGraphqlOK(
      `
        query($username: String!) {
          getUserByUsername(username: $username) {
            email
            avatar
          }
        }
      `,
      { username: 'glen' },
      {
        getUserByUsername: {
          email: 'glen@glen.com',
          avatar: 'https://www.fillmurray.com/200/200',
        },
      }
    )
  })
})
