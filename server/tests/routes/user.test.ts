import { describe, it, vi, expect, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')

  return createRouteChain()
})

vi.mock('../../src/controllers/user', () =>
  h.mocks.controllers(
    'getCurrentUser',
    'patchUser',
    'getAllUsers',
    'patchUsers',
    'exchangeOneTimeCode',
    'deleteUserSession',
  ),
)

vi.mock('../../src/middleware/authGuard', () => h.mocks.authGuard())

import router from '../../src/routes/user'

const app = express()
app.use('/api/user', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('user routes', () => {
  it.each([
    ['get', '/api/user/me', ['authGuard', 'getCurrentUser']],
    ['patch', '/api/user/me', ['authGuard', 'patchUser']],
    ['get', '/api/user/all', ['authGuard', 'getAllUsers']],
    ['patch', '/api/user/all', ['authGuard', 'patchUsers']],
    ['post', '/api/user/otc', ['exchangeOneTimeCode']],
    ['post', '/api/user/logout', ['deleteUserSession']],
  ] as const)(
    '%s %s executes the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )
})
