import { describe, it, expect, vi, beforeEach, MockedFunction } from 'vitest'
import express from 'express'
import request from 'supertest'

const h = await vi.hoisted(async () => {
  const { createRouteChain } = await import('../helpers/routeChain')
  return createRouteChain()
})

vi.mock('../../src/controllers/model', () =>
  h.mocks.controllers(
    'getModels',
    'getModel',
    'newModel',
    'updateModel',
    'getModelThumbnailUrl',
    'getModelObjectUrl',
    'getModelUploadUrl',
    'getNewThumbnailUrl',
    'deleteModel',
  ),
)

vi.mock('../../src/middleware/validate', () => h.mocks.validate())
vi.mock('../../src/middleware/authGuard.ts', () => h.mocks.authGuard())

vi.mock('../../src/scripts/validators', () =>
  h.mocks.validators('modelSchema', 'modelEditSchema'),
)

import router from '../../src/routes/model'
import { validateModifyPermissions } from '../../src/middleware/validate'

const idGetters: Array<({ params: {} }) => string> = (
  validateModifyPermissions as unknown as MockedFunction<express.RequestHandler>
).mock.calls.map(([fn]: any[]) => fn)

const app = express()
app.use('/api/models', router)

beforeEach(() => {
  h.trace.length = 0
})

describe('model routes', () => {
  it.each([
    ['get', '/api/models', ['getModels']],
    ['get', '/api/models/1', ['getModel']],
    ['get', '/api/models/1/thumbnail-url', ['getModelThumbnailUrl']],
    ['get', '/api/models/1/object', ['getModelObjectUrl']],
    [
      'post',
      '/api/models',
      [
        'authGuard',
        'validateUploadPermissions',
        'validateBody(modelSchema)',
        'newModel',
      ],
    ],
    [
      'post',
      '/api/models/upload-url',
      ['authGuard', 'validateUploadPermissions', 'getModelUploadUrl'],
    ],
    [
      'post',
      '/api/models/new-thumbnail/1',
      ['authGuard', 'validateModifyPermissions', 'getNewThumbnailUrl'],
    ],
    [
      'put',
      '/api/models/1',
      [
        'authGuard',
        'validateModifyPermissions',
        'validateBody(modelEditSchema)',
        'updateModel',
      ],
    ],
    [
      'delete',
      '/api/models/1',
      ['authGuard', 'validateModifyPermissions', 'deleteModel'],
    ],
  ] as const)(
    '%s %s runs the expected chain',
    async (method, endpoint, chain) => {
      const res = await request(app)[method](endpoint)

      expect(res.status).toBe(200)
      expect(h.trace).toEqual(chain)
    },
  )

  it('reads the model id from req.params.id for modify permissions', () => {
    expect(idGetters).toHaveLength(3)

    for (const getId of idGetters) {
      expect(getId({ params: { id: 'abc' } })).toBe('abc')
    }
  })
})
