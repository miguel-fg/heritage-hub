import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')

  return createRouteChain()
})

vi.mock('../../src/controllers/pdf', () =>
  h.mocks.controllers('createPdfs', 'deletePdf', 'processPdf', 'cancelPdfs'),
)

vi.mock('../../src/middleware/validate', () => h.mocks.validate())
vi.mock('../../src/middleware/authGuard', () => h.mocks.authGuard())
vi.mock('../../src/middleware/upload', () => h.mocks.upload())

vi.mock('../../src/scripts/validators', () =>
  h.mocks.validators('modelPdfsSchema'),
)

import router from '../../src/routes/pdf'

const app = express()
app.use('/api/pdfs', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('pdf routes', () => {
  it.each([
    [
      'post',
      '/api/pdfs',
      [
        'authGuard',
        'validateModifyPermissions',
        'validateBody(modelPdfsSchema)',
        'createPdfs',
      ],
    ],
    [
      'post',
      '/api/pdfs/process',
      [
        'authGuard',
        'upload.single(file)',
        'validateModifyPermissions',
        'processPdf',
      ],
    ],
    [
      'delete',
      '/api/pdfs',
      ['authGuard', 'validateModifyPermissions', 'deletePdf'],
    ],
    [
      'delete',
      '/api/pdfs/process',
      ['authGuard', 'validateModifyPermissions', 'cancelPdfs'],
    ],
  ] as const)(
    '%s %s runs the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )
})
