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
  asset: {
    createMany: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

const mockGeneratePresignedUrl = vi.hoisted(() => vi.fn())
const mockGeneratePresignedUploadUrl = vi.hoisted(() => vi.fn())
const mockDeleteAllFromR2 = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/r2Storage', () => ({
  generatePresignedUrl: mockGeneratePresignedUrl,
  generatePresignedUploadUrl: mockGeneratePresignedUploadUrl,
  deleteAllFromR2: mockDeleteAllFromR2,
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
        images: [],
        pdfs: [],
        assets: [],
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
          assets: true,
          images: { orderBy: { order: 'asc' } },
          pdfs: {
            select: { id: true, title: true },
          },
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
    it('should return a presigned object URL for a GLB model', async () => {
      const modelId = fakeModel.id
      mockRequest.params = { id: modelId }
      mockRequest.query = {}
      prismaMock.model.findUnique.mockResolvedValueOnce({ objFileType: 'GLB' })
      mockGeneratePresignedUrl.mockResolvedValueOnce('presignedObject.url')
      await getModelObjectUrl(mockRequest as Request, mockResponse as Response)
      expect(prismaMock.model.findUnique).toHaveBeenCalledWith({
        where: { id: modelId },
        select: { objFileType: true },
      })
      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(
        undefined,
        `${modelId}/model.glb`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        objectUrl: 'presignedObject.url',
      })
    })

    it('should return presigned URLs for an OBJ model', async () => {
      const modelId = fakeModel.id
      const textures = 'diffuse.jpg,normal.png'
      mockRequest.params = { id: modelId }
      mockRequest.query = { textures }
      prismaMock.model.findUnique.mockResolvedValueOnce({ objFileType: 'OBJ' })
      mockGeneratePresignedUrl
        .mockResolvedValueOnce('presignedObj.url')
        .mockResolvedValueOnce('presignedMtl.url')
        .mockResolvedValueOnce('presignedTexture0.url')
        .mockResolvedValueOnce('presignedTexture1.url')
      await getModelObjectUrl(mockRequest as Request, mockResponse as Response)
      expect(mockGeneratePresignedUrl).toHaveBeenCalledTimes(4)
      expect(mockGeneratePresignedUrl).toHaveBeenNthCalledWith(
        1,
        undefined,
        `${modelId}/model.obj`,
      )
      expect(mockGeneratePresignedUrl).toHaveBeenNthCalledWith(
        2,
        undefined,
        `${modelId}/materials.mtl`,
      )
      expect(mockGeneratePresignedUrl).toHaveBeenNthCalledWith(
        3,
        undefined,
        `${modelId}/textures/diffuse.jpg`,
      )
      expect(mockGeneratePresignedUrl).toHaveBeenNthCalledWith(
        4,
        undefined,
        `${modelId}/textures/normal.png`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        objUrl: 'presignedObj.url',
        mtlUrl: 'presignedMtl.url',
        textureUrls: [
          { filename: 'diffuse.jpg', url: 'presignedTexture0.url' },
          { filename: 'normal.png', url: 'presignedTexture1.url' },
        ],
      })
    })

    it('should return 404 if model is not found', async () => {
      mockRequest.params = { id: 'nonexistent-id' }
      mockRequest.query = {}
      prismaMock.model.findUnique.mockResolvedValueOnce(null)
      await getModelObjectUrl(mockRequest as Request, mockResponse as Response)
      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Model not found' })
    })

    it('should handle presigned URL generation errors', async () => {
      mockRequest.params = { id: fakeModel.id }
      mockRequest.query = {}
      prismaMock.model.findUnique.mockResolvedValueOnce({ objFileType: 'GLB' })
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
    it('should return GLB upload presigned URLs', async () => {
      const modelId = fakeModel.id
      mockRequest.body = { modelId, fileType: 'GLB' }
      mockGeneratePresignedUploadUrl
        .mockResolvedValueOnce('thumbnailUpload.url')
        .mockResolvedValueOnce('objectUpload.url')
      await getModelUploadUrl(mockRequest as Request, mockResponse as Response)
      expect(mockGeneratePresignedUploadUrl).toBeCalledTimes(2)
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        1,
        undefined,
        `${modelId}/thumbnail.png`,
      )
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        2,
        undefined,
        `${modelId}/model.glb`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        modelUrl: 'objectUpload.url',
        thumbnailUrl: 'thumbnailUpload.url',
      })
    })

    it('should return OBJ upload presigned URLs', async () => {
      const modelId = fakeModel.id
      const textures = ['diffuse.jpg', 'normal.png']
      mockRequest.body = { modelId, fileType: 'OBJ', textures }
      mockGeneratePresignedUploadUrl
        .mockResolvedValueOnce('thumbnailUpload.url')
        .mockResolvedValueOnce('objectUpload.url')
        .mockResolvedValueOnce('materialsUpload.url')
        .mockResolvedValueOnce('texture0Upload.url')
        .mockResolvedValueOnce('texture1Upload.url')
      await getModelUploadUrl(mockRequest as Request, mockResponse as Response)
      expect(mockGeneratePresignedUploadUrl).toBeCalledTimes(5)
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        1,
        undefined,
        `${modelId}/thumbnail.png`,
      )
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        2,
        undefined,
        `${modelId}/model.obj`,
      )
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        3,
        undefined,
        `${modelId}/materials.mtl`,
      )
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        4,
        undefined,
        `${modelId}/textures/diffuse.jpg`,
      )
      expect(mockGeneratePresignedUploadUrl).toHaveBeenNthCalledWith(
        5,
        undefined,
        `${modelId}/textures/normal.png`,
      )
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        modelUrl: 'objectUpload.url',
        materialsUrl: 'materialsUpload.url',
        thumbnailUrl: 'thumbnailUpload.url',
        textureUrls: [
          { filename: 'diffuse.jpg', url: 'texture0Upload.url' },
          { filename: 'normal.png', url: 'texture1Upload.url' },
        ],
      })
    })

    it('should handle upload URL generation errors', async () => {
      mockRequest.body = { modelId: 'invalid-id', fileType: 'GLB' }
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

      prismaMock.$transaction.mockResolvedValue([{}, {}, {}, {}])

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

      await deleteModel(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.model.findUnique).toHaveBeenCalledWith({
        where: { id: fakeModel.id },
      })

      expect(prismaMock.model.delete).toHaveBeenCalledWith({
        where: { id: fakeModel.id },
      })

      expect(mockDeleteAllFromR2).toHaveBeenCalledTimes(1)
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
