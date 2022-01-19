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

  test('single field', async () => {
    const cache = await caches.open(`holodb:edge`)
    await cache.put(`https://holo.db/${userId}/avatar`, cachedJson('OMFG HAX'))
    console.log(await cache.match(`https://holo.db/${userId}/avatar`))

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
})
