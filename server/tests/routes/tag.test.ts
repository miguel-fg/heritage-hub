import { describe, it, vi, expect, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')

  return createRouteChain()
})

vi.mock('../../src/controllers/tag', () => h.mocks.controllers('getTags'))

import router from '../../src/routes/tag'

const app = express()
app.use('/api/tags', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('tag routes', () => {
  it.each([['get', '/api/tags', ['getTags']]] as const)(
    '%s %s executes the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )
})
