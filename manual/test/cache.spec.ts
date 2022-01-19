import { createObject, testTqlOK } from './utils'
import { query } from '../schema.tql'
import { cachedJson, jsonResponse } from '@/utils'

describe('single User', () => {
  let userId: string
  beforeEach(async () => {
    userId = await createObject(
      'HOLODB_USER',
      { username: 'glen' },
      { email: 'glen@glen.com', avatar: 'https://www.fillmurray.com/200/200' }
    )
  })

  test('single precached field', async () => {
    const cache = await caches.open(`holodb:edge`)
    await cache.put(`https://holo.db/${userId}/avatar`, cachedJson('OMFG HAX'))

    await testTqlOK(
      query('', (t) => [
        t.getUserByUsername({ username: 'glen' }, (t) => [t.email(), t.avatar()]),
      ]),
      {
        getUserByUsername: {
          email: 'glen@glen.com',
          avatar: 'OMFG HAX',
        },
      },
      [`${userId}/email MISS`, `${userId}/avatar HIT`]
    )
  })

  test('re-reading same field', async () => {
    await testTqlOK(
      query('', (t) => [t.getUserById({ id: userId }, (t) => [t.username()])]),
      {
        getUserById: {
          username: 'glen',
        },
      },
      [`${userId}/username MISS`]
    )

    await testTqlOK(
      query('', (t) => [t.getUserById({ id: userId }, (t) => [t.username(), t.email()])]),
      {
        getUserById: {
          username: 'glen',
          email: 'glen@glen.com',
        },
      },
      [`${userId}/email MISS`, `${userId}/username HIT`]
    )
  })
})
