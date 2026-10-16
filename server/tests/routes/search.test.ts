import { describe, it, vi, expect, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')

  return createRouteChain()
})

vi.mock('../../src/controllers/search', () =>
  h.mocks.controllers('searchModels'),
)

import router from '../../src/routes/search'

const app = express()
app.use('/api/search', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('tag routes', () => {
  it.each([['get', '/api/search', ['searchModels']]] as const)(
    '%s %s executes the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )
})
