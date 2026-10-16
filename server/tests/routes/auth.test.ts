import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')

  return createRouteChain()
})

vi.mock('../../src/controllers/auth', () =>
  h.mocks.controllers('redirectCAS', 'validateCASTicket'),
)

import router from '../../src/routes/auth'

const app = express()
app.use('/api/cas', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('auth routes', () => {
  it.each([
    ['get', '/api/cas/login', ['redirectCAS']],
    ['get', '/api/cas/callback', ['validateCASTicket']],
  ] as const)(
    '%s %s executes the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )
})
