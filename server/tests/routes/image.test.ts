import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')
  return createRouteChain()
})

vi.mock('../../src/controllers/image', () =>
  h.mocks.controllers(
    'createImages',
    'deleteImage',
    'processImage',
    'cancelImages',
    'editImage',
  ),
)
vi.mock('../../src/middleware/validate', () => h.mocks.validate())
vi.mock('../../src/middleware/authGuard', () => h.mocks.authGuard())
vi.mock('../../src/middleware/upload', () => h.mocks.upload())

vi.mock('../../src/scripts/validators', () =>
  h.mocks.validators('modelImagesSchema', 'modelImageEditSchema'),
)

import router from '../../src/routes/image'

const app = express()
app.use('/api/images', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('image routes', () => {
  it.each([
    [
      'post',
      '/api/images',
      [
        'authGuard',
        'validateModifyPermissions',
        'validateBody(modelImagesSchema)',
        'createImages',
      ],
    ],
    [
      'post',
      '/api/images/process',
      [
        'authGuard',
        'upload.single(file)',
        'validateModifyPermissions',
        'processImage',
      ],
    ],
    [
      'put',
      '/api/images/edit/1',
      [
        'authGuard',
        'validateModifyPermissions',
        'validateBody(modelImageEditSchema)',
        'editImage',
      ],
    ],
    [
      'delete',
      '/api/images',
      ['authGuard', 'validateModifyPermissions', 'deleteImage'],
    ],
    [
      'delete',
      '/api/images/process',
      ['authGuard', 'validateModifyPermissions', 'cancelImages'],
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
