import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import {
  fakeModel,
  fakeTag,
  fakeMaterial,
  fakeUser,
  fakeDimension,
  fakeHotspot,
} from '../../fixtures/fakes'

const prismaMock = vi.hoisted(() => ({
  model: {
    count: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  dimension: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  hotspot: {
    createMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

const mockGeneratePresignedUrl = vi.hoisted(() => vi.fn())
const mockGeneratePresignedUploadUrl = vi.hoisted(() => vi.fn())
const mockDeleteObjectFromR2 = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/r2Storage', () => ({
  generatePresignedUrl: mockGeneratePresignedUrl,
  generatePresignedUploadUrl: mockGeneratePresignedUploadUrl,
  deleteObjectFromR2: mockDeleteObjectFromR2,
}))

import {
  getModel,
  getModels,
  getModelThumbnailUrl,
  getModelObjectUrl,
  getModelUploadUrl,
  newModel,
  updateModel,
  deleteModel,
} from '../../../src/controllers/model'
import { ModelRequestBody } from '../../../src/scripts/validators'

describe('Model Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockJson = vi.fn()
    mockSend = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ json: mockJson, send: mockSend })

    mockRequest = {}
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    } as unknown as Response
  })

  describe('getModels', () => {
    it('should return models with pagination', async () => {
      const models = [
        {
          ...fakeModel,
          tags: [fakeTag],
          materials: [fakeMaterial],
        },
      ]

      mockRequest.query = { limit: '12', skip: '1' }

      prismaMock.model.count.mockResolvedValue(1)
      prismaMock.model.findMany.mockResolvedValue(models)

      await getModels(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.model.count).toHaveBeenCalledTimes(1)
      expect(prismaMock.model.findMany).toHaveBeenCalledWith({
        select: expect.objectContaining({
          id: true,
          name: true,
          caption: true,
        }),
        orderBy: { createdAt: 'desc' },
        take: 12,
        skip: 1,
      })
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ models, total: 1 })
    })

    it('should use default pagination values when not provided', async () => {
      mockRequest.query = {}

      prismaMock.model.count.mockResolvedValue(0)
      prismaMock.model.findMany.mockResolvedValue([])

      await getModels(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 18,
          skip: 0,
        }),
      )
    })

    it('should handle database errors', async () => {
      mockRequest.query = {}

      const error = new Error('Database connection failed')
      prismaMock.model.count.mockRejectedValue(error)

      await getModels(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to fetch models'),
      })
    })
  })

  describe('getModel', () => {
    it('should return a single model with all relations', async () => {
      const model = {
        ...fakeModel,
        owner: { fakeUser },
        materials: [fakeMaterial],
        tags: [fakeTag],
        dimensions: [fakeDimension],
        hotspots: [fakeHotspot],
      }

      mockRequest.params = { id: fakeModel.id }
      prismaMock.model.findUnique.mockResolvedValue(model)

      await getModel(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.model.findUnique).toHaveBeenCalledWith({
        where: { id: fakeModel.id },
        include: {
          owner: {
            select: { displayName: true },
          },
          materials: {
            select: { name: true },
          },
          tags: {
            select: { name: true },
          },
          dimensions: {
            select: { type: true, value: true, unit: true },
          },
          hotspots: true,
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ model })
    })

    it('should handle errors when fetching a single model', async () => {
      mockRequest.params = { id: 'invalid-id' }
      const error = new Error('Model not found')

      prismaMock.model.findUnique.mockRejectedValue(error)

      await getModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to fetch model data'),
      })
    })
  })

  describe('getModelThumbnailUrl', () => {
    it('should return a presigned thumbnail URL', async () => {
      const modelId = fakeModel.id

      mockRequest.params = { id: modelId }

      mockGeneratePresignedUrl.mockReturnValue('presignedThumbnail.url')

      await getModelThumbnailUrl(
        mockRequest as Request,
        mockResponse as Response,
      )

      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(
        undefined,
        `${modelId}/thumbnail.png`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        thumbnailUrl: 'presignedThumbnail.url',
      })
    })

    it('should handle thumbnail URL generation errors', async () => {
      mockRequest.params = { id: 'invalid-id' }
      const error = new Error('Could not generate presigned URL')

      mockGeneratePresignedUrl.mockRejectedValue(error)

      await getModelThumbnailUrl(
        mockRequest as Request,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to generate presigned URL'),
      })
    })
  })

  describe('getModelObjectUrl', () => {
    it('should return a presigned object URL', async () => {
      const modelId = fakeModel.id

      mockRequest.params = { id: modelId }

      mockGeneratePresignedUrl.mockReturnValue('presignedObject.url')

      await getModelObjectUrl(mockRequest as Request, mockResponse as Response)

      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(
        undefined,
        `${modelId}/model.glb`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        objectUrl: 'presignedObject.url',
      })
    })

    it('should handle object URL generation errors', async () => {
      mockRequest.params = { id: 'invalid-id' }
      const error = new Error('Could not generate presigned URL')

      mockGeneratePresignedUrl.mockRejectedValue(error)

      await getModelObjectUrl(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to generate presigned URL'),
      })
    })
  })

  describe('getModelUploadUrl', () => {
    it('should return two upload presigned URLs', async () => {
      const modelId = fakeModel.id
      mockRequest.body = { modelId }

      mockGeneratePresignedUploadUrl
        .mockReturnValueOnce('objectUpload.url')
        .mockReturnValueOnce('thumbnailUpload.url')

      await getModelUploadUrl(mockRequest as Request, mockResponse as Response)

      expect(mockGeneratePresignedUploadUrl).toBeCalledTimes(2)
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        1,
        undefined,
        `${modelId}/model.glb`,
      )
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        2,
        undefined,
        `${modelId}/thumbnail.png`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        modelUrl: 'objectUpload.url',
        thumbnailUrl: 'thumbnailUpload.url',
      })
    })

    it('should handle upload URL generation errors', async () => {
      mockRequest.body = { modelId: 'invalid-id' }
      const error = new Error('Could not generate upload URL')

      mockGeneratePresignedUploadUrl.mockRejectedValue(error)

      await getModelUploadUrl(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toBeCalledWith({
        error: expect.stringContaining('Failed to generate upload URL'),
      })
    })
  })

  describe('newModel', () => {
    it('should successfully create new models', async () => {
      mockRequest.body = { ...fakeModel }
      mockRequest.user = fakeUser

      prismaMock.$transaction.mockResolvedValue([{}, {}, {}])

      await newModel(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Model created successfully',
        modelId: fakeModel.id,
      })
    })

    it('should reject unauthenticated requests', async () => {
      mockRequest.user = undefined

      await newModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('should handle database errors during model creation', async () => {
      mockRequest.body = { ...fakeModel }
      mockRequest.user = fakeUser

      const error = new Error('Database transaction failed')
      prismaMock.$transaction.mockRejectedValue(error)

      await newModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to create model'),
      })
    })
  })

  describe('updateModel', () => {
    it('should update a model successfully', async () => {
      mockRequest.body = { ...fakeModel }
      mockRequest.user = fakeUser
      mockRequest.params = { id: fakeModel.id }

      prismaMock.$transaction.mockResolvedValue([{}, {}, {}, {}, {}, {}])

      await updateModel(
        mockRequest as Request<{ id: string }, unknown, ModelRequestBody>,
        mockResponse as Response,
      )

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Model updated successfully',
        modelId: fakeModel.id,
      })
    })

    it('should reject requests with mismatched IDs', async () => {
      mockRequest.body = { ...fakeModel }
      mockRequest.user = fakeUser
      mockRequest.params = { id: 'mismatched-id' }

      await updateModel(
        mockRequest as Request<{ id: string }, unknown, ModelRequestBody>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Model ID in URL does not match the ID in the request body',
      })
    })

    it('should reject unauthenticated requests', async () => {
      mockRequest.user = undefined

      await updateModel(
        mockRequest as Request<{ id: string }, unknown, ModelRequestBody>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('should handle database errors during model update', async () => {
      mockRequest.body = { ...fakeModel }
      mockRequest.user = fakeUser
      mockRequest.params = { id: fakeModel.id }

      const error = new Error('Database update failed')
      prismaMock.$transaction.mockRejectedValue(error)

      await updateModel(
        mockRequest as Request<{ id: string }, unknown, ModelRequestBody>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to update model'),
      })
    })
  })

  describe('deleteModel', () => {
    it('should delete a model successfully', async () => {
      mockRequest.params = { id: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.model.findUnique.mockResolvedValue(fakeModel)
      prismaMock.model.delete.mockResolvedValue(fakeModel)
      mockDeleteObjectFromR2.mockResolvedValue(undefined)

      await deleteModel(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.model.findUnique).toHaveBeenCalledWith({
        where: { id: fakeModel.id },
      })

      expect(prismaMock.model.delete).toHaveBeenCalledWith({
        where: { id: fakeModel.id },
      })

      expect(mockDeleteObjectFromR2).toHaveBeenCalledTimes(2)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: `Model ${fakeModel.id} deleted successfully!`,
      })
    })

    it('should reject requests without model ID', async () => {
      mockRequest.user = fakeUser
      mockRequest.params = {}

      await deleteModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Model ID is required' })
    })

    it('should return 404 when model does not exist', async () => {
      mockRequest.user = fakeUser
      mockRequest.params = { id: 'non-existent-id' }

      prismaMock.model.findUnique.mockResolvedValue(null)

      await deleteModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Model non-existent-id not found.',
      })
    })

    it('should reject unauthenticated requests', async () => {
      mockRequest.user = undefined

      await deleteModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('should handle database errors during model deletion', async () => {
      mockRequest.user = fakeUser
      mockRequest.params = { id: fakeModel.id }

      const error = new Error('Database deletion failed')
      prismaMock.model.findUnique.mockResolvedValue(fakeModel)
      prismaMock.model.delete.mockRejectedValue(error)

      await deleteModel(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to delete model'),
      })
    })
  })
})
