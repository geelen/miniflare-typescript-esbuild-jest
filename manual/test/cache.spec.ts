import { createObject, testTqlOK } from './utils'
import { query } from '../schema.tql'

describe('single User', () => {
  beforeEach(async () => {
    await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
  })

  test('single field', async () => {
    await testTqlOK(
      query('', (t) => [
        t.getUserByUsername({ username: 'glen' }, (t) => [t.email(), t.avatar()]),
      ]),
      {
        getUserByUsername: {
          email: 'glen@glen.com',
          avatar: 'https://www.fillmurray.com/200/200',
        },
      }
    )
  })
})
