import { describe, it, vi, expect, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')

  return createRouteChain()
})

vi.mock('../../src/controllers/material', () =>
  h.mocks.controllers('getMaterials'),
)

import router from '../../src/routes/material'

const app = express()
app.use('/api/materials', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('material routes', () => {
  it.each([['get', '/api/materials', ['getMaterials']]] as const)(
    '%s %s executes the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )
})
