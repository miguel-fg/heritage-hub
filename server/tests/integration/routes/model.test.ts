import {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest'
import request from 'supertest'
import app from '../../../src/app'
import prisma from '../../../src/services/prisma'
import {
  seedUser,
  seedModel,
  seedCompleteModel,
  seedMultipleModels,
  cleanupDatabase,
} from '../../helpers/seedData'
import {
  createAuthenticatedUser,
  createAuthenticatedAdmin,
  createRestrictedUser,
  getAuthCookie,
  createAuthenticatedFull,
} from '../../helpers/authUtils'

vi.mock('../../../src/scripts/r2Storage', () => ({
  generatePresignedUrl: vi
    .fn()
    .mockResolvedValue('https://r2.example.com/presigned-url'),
  generatePresignedUploadUrl: vi
    .fn()
    .mockResolvedValue('https://r2.example.com/upload-url'),
  deleteObjectFromR2: vi.fn().mockResolvedValue(undefined),
}))

describe('Model Routes - Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await cleanupDatabase()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await cleanupDatabase()
  })

  describe('GET /api/models', () => {
    it('should return paginated models', async () => {
      const user = await seedUser()
      await seedMultipleModels(user.id, 5)

      const response = await request(app)
        .get('/api/models')
        .query({ limit: 3, skip: 0 })

      expect(response.status).toBe(200)
      expect(response.body.models).toHaveLength(3)
      expect(response.body.total).toBe(5)
      expect(response.body.models[0]).toHaveProperty('id')
      expect(response.body.models[0]).toHaveProperty('name')
      expect(response.body.models[0]).toHaveProperty('caption')
      expect(response.body.models[0]).toHaveProperty('tags')
      expect(response.body.models[0]).toHaveProperty('materials')
    })

    it('should use default pagination values', async () => {
      const user = await seedUser()
      await seedMultipleModels(user.id, 20)

      const response = await request(app).get('/api/models')

      expect(response.status).toBe(200)
      expect(response.body.models).toHaveLength(18)
      expect(response.body.total).toBe(20)
    })

    it('should return models ordered by createdAt desc', async () => {
      const user = await seedUser()
      const model1 = await seedModel({ ownerId: user.id, name: 'First Model' })
      await new Promise((resolve) => setTimeout(resolve, 10))
      const model2 = await seedModel({ ownerId: user.id, name: 'Second Model' })

      const response = await request(app).get('/api/models')

      expect(response.status).toBe(200)
      expect(response.body.models[0].id).toBe(model2.id)
      expect(response.body.models[1].id).toBe(model1.id)
    })

    it('should return empty array when no models exist', async () => {
      const response = await request(app).get('/api/models')

      expect(response.status).toBe(200)
      expect(response.body.models).toEqual([])
      expect(response.body.total).toBe(0)
    })
  })

  describe('GET /api/models/:id', () => {
    it('should return a single model with all relations', async () => {
      const user = await seedUser()
      const { model } = await seedCompleteModel({
        ownerId: user.id,
        withDimensions: true,
        withHotspots: true,
        withTags: true,
        withMaterials: true,
      })

      const response = await request(app).get(`/api/models/${model.id}`)

      expect(response.status).toBe(200)
      expect(response.body.model.dimensions).toHaveLength(3)
      expect(response.body.model.hotspots).toHaveLength(2)
      expect(response.body.model.tags).toBeDefined()
      expect(response.body.model.materials).toBeDefined()
    })

    it('should return null for non-existent models', async () => {
      const response = await request(app).get('/api/models/non-existent-id')

      expect(response.status).toBe(500)
      expect(response.body.model).toBeFalsy()
      expect(response.body.error).toBeTruthy()
    })
  })

  describe('GET /api/models/:id/thumbnail-url', () => {
    it('should return presigned thumbnail URL', async () => {
      const user = await seedUser()
      const model = await seedModel({ ownerId: user.id })

      const response = await request(app).get(
        `/api/models/${model.id}/thumbnail-url`,
      )

      expect(response.status).toBe(200)
      expect(response.body.thumbnailUrl).toBe(
        'https://r2.example.com/presigned-url',
      )
    })
  })

  describe('GET /api/models/:id/object', () => {
    it('should return presigned object URL', async () => {
      const user = await seedUser()
      const model = await seedModel({ ownerId: user.id })

      const response = await request(app).get(`/api/models/${model.id}/object`)

      expect(response.status).toBe(200)
      expect(response.body.objectUrl).toBe(
        'https://r2.example.com/presigned-url',
      )
    })
  })

  describe('POST /api/models/upload-url', () => {
    it('should return upload URLs for authenticated users', async () => {
      const { sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .post('/api/models/upload-url')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ modelId: 'test-model-123' })

      expect(response.status).toBe(200)
      expect(response.body.modelUrl).toBe('https://r2.example.com/upload-url')
      expect(response.body.thumbnailUrl).toBe(
        'https://r2.example.com/upload-url',
      )
    })

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/models/upload-url')
        .set('Origin', 'http://localhost:5173')
        .send({ modelId: 'test-model-123' })

      expect(response.status).toBe(401)
    })

    it('should reject restricted users', async () => {
      const { sessionToken } = await createRestrictedUser()

      const response = await request(app)
        .post('/api/models/upload-url')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ modelId: 'test-model-123' })

      expect(response.status).toBe(403)
      expect(response.text).toContain('Cannot upload models')
    })
  })

  describe('POST /api/models', () => {
    it('should create a new model with all relations', async () => {
      const { user, sessionToken } = await createAuthenticatedUser()

      const modelId = 'c3c6bf84-1536-4478-a0f8-81021e2580b9'

      const modelData = {
        id: modelId,
        name: 'Test Model',
        caption: 'A test model caption',
        description: 'A test detailed description',
        accNum: 'ACC-001',
        provenance: 'Test provenance',
        downloadable: true,
        tags: [{ where: { name: 'Ancient' }, create: { name: 'Ancient' } }],
        materials: [
          { where: { name: 'Ceramic' }, create: { name: 'Ceramic' } },
        ],
        dimensions: [{ modelId, type: 'HEIGHT', value: 10.5, unit: 'cm' }],
        hotspots: [
          {
            modelId,
            label: 'Detail',
            content: 'Important detail',
            posX: 1.0,
            posY: 2.0,
            posZ: 3.0,
            norX: 0,
            norY: 1,
            norZ: 0,
            quatX: 0,
            quatY: 0,
            quatZ: 0,
            quatW: 1,
          },
        ],
      }

      const response = await request(app)
        .post('/api/models')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send(modelData)

      expect(response.status).toBe(201)
      expect(response.body.message).toBe('Model created successfully')

      const createdModel = await prisma.model.findUnique({
        where: { id: 'c3c6bf84-1536-4478-a0f8-81021e2580b9' },
        include: {
          dimensions: true,
          hotspots: true,
          tags: true,
          materials: true,
        },
      })

      expect(createdModel).toBeDefined()
      expect(createdModel!.ownerId).toBe(user.id)
      expect(createdModel!.dimensions).toHaveLength(1)
      expect(createdModel!.hotspots).toHaveLength(1)
    })

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/models')
        .set('Origin', 'http://localhost:5173')
        .send({ name: 'Test' })

      expect(response.status).toBe(401)
    })

    it('should reject restricted users', async () => {
      const { sessionToken } = await createRestrictedUser()

      const response = await request(app)
        .post('/api/models')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ name: 'Test' })

      expect(response.status).toBe(403)
    })

    it('should reject invalid model data', async () => {
      const { sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .post('/api/models')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ name: 'Test' })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid request body')
    })
  })

  describe('PUT /api/models/:id', () => {
    it('should allow owner to update their model', async () => {
      const { user, sessionToken } = await createAuthenticatedUser()
      const model = await seedModel({ ownerId: user.id })

      const updateData = {
        id: model.id,
        name: 'Updated Name',
        caption: 'Updated test caption',
        description: 'Updated detailed test description',
        accNum: model.accNum,
        provenance: model.provenance,
        downloadable: false,
        tags: [],
        materials: [],
        dimensions: [],
        hotspots: [],
      }

      const response = await request(app)
        .put(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Model updated successfully')

      const updatedModel = await prisma.model.findUnique({
        where: { id: model.id },
      })

      expect(updatedModel).toBeDefined()
    })

    it('should allow ADMIN user to update any model', async () => {
      const owner = await seedUser()
      const model = await seedModel({ ownerId: owner.id })
      const { sessionToken } = await createAuthenticatedAdmin()

      const updateData = {
        id: model.id,
        name: 'Admin Updated',
        caption: 'Admin updated test caption',
        description: 'Admin updated detailed test description',
        accNum: model.accNum,
        provenance: model.provenance,
        downloadable: true,
        tags: [],
        materials: [],
        dimensions: [],
        hotspots: [],
      }

      const response = await request(app)
        .put(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send(updateData)

      expect(response.status).toBe(200)
    })

    it('should allow FULL user to update any model', async () => {
      const owner = await seedUser()
      const model = await seedModel({ ownerId: owner.id })
      const { sessionToken } = await createAuthenticatedFull()

      const updateData = {
        id: model.id,
        name: 'Full Updated',
        caption: 'Full updated test caption',
        description: 'Full updated detailed test description',
        accNum: model.accNum,
        provenance: model.provenance,
        downloadable: true,
        tags: [],
        materials: [],
        dimensions: [],
        hotspots: [],
      }

      const response = await request(app)
        .put(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send(updateData)

      expect(response.status).toBe(200)
    })

    it('should reject STANDARD user updating someone elses model', async () => {
      const owner = await seedUser()
      const model = await seedModel({ ownerId: owner.id })
      const { sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .put(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ name: 'Unauthorized Update' })

      expect(response.status).toBe(403)
      expect(response.text).toContain("You don't own this model")
    })

    it('should reject mismatched IDs', async () => {
      const { user, sessionToken } = await createAuthenticatedUser()
      const model = await seedModel({ ownerId: user.id })

      const updateData = {
        id: '44c54548-9717-4a33-84da-e8ab737f394d',
        name: 'Updated Name',
        caption: 'Updated test caption',
        description: 'Updated detailed test description',
        accNum: model.accNum,
        provenance: model.provenance,
        downloadable: false,
        tags: [],
        materials: [],
        dimensions: [],
        hotspots: [],
      }

      const response = await request(app)
        .put(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send(updateData)

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('does not match')
    })

    it('should reject unauthenticated requests', async () => {
      const user = await seedUser()
      const model = await seedModel({ ownerId: user.id })

      const response = await request(app)
        .put(`/api/models/${model.id}`)
        .set('Origin', 'http://localhost:5173')
        .send({ id: model.id, name: 'Test' })

      expect(response.status).toBe(401)
    })
  })

  describe('DELETE /api/models/:id', () => {
    it('should allow owner to delete their model', async () => {
      const { user, sessionToken } = await createAuthenticatedUser()
      const model = await seedModel({ ownerId: user.id })

      const response = await request(app)
        .delete(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.message).toContain('deleted successfully')

      const deletedModel = await prisma.model.findUnique({
        where: { id: model.id },
      })

      expect(deletedModel).toBeNull()
    })

    it('should allow ADMIN user to delete any model', async () => {
      const owner = await seedUser()
      const model = await seedModel({ ownerId: owner.id })
      const { sessionToken } = await createAuthenticatedAdmin()

      const response = await request(app)
        .delete(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)

      const deletedModel = await prisma.model.findUnique({
        where: { id: model.id },
      })

      expect(deletedModel).toBeNull()
    })

    it('should allow FULL user to delete any model', async () => {
      const owner = await seedUser()
      const model = await seedModel({ ownerId: owner.id })
      const { sessionToken } = await createAuthenticatedFull()

      const response = await request(app)
        .delete(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)

      const deletedModel = await prisma.model.findUnique({
        where: { id: model.id },
      })

      expect(deletedModel).toBeNull()
    })

    it('should reject STANDARD user deleting someone elses model', async () => {
      const owner = await seedUser()
      const model = await seedModel({ ownerId: owner.id })
      const { sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .delete(`/api/models/${model.id}`)
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(403)

      const existingModel = await prisma.model.findUnique({
        where: { id: model.id },
      })

      expect(existingModel).toBeDefined()
    })

    it('should return 404 for non-existent model', async () => {
      const { sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .delete('/api/models/00000000-0000-0000-0000-000000000000')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(404)
    })

    it('should reject unauthenticated requests', async () => {
      const user = await seedUser()
      const model = await seedModel({ ownerId: user.id })

      const response = await request(app)
        .delete(`/api/models/${model.id}`)
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(401)
    })
  })
})
