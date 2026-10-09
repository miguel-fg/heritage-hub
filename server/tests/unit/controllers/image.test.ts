import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import {
  fakeModel,
  fakeModelImage,
  fakeUser,
  fakeMulterFile,
} from '../../fixtures/fakes'
import { PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const prismaMock = vi.hoisted(() => ({
  modelImage: {
    createManyAndReturn: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

const mockGeneratePresignedUrl = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/r2Storage', () => ({
  generatePresignedUrl: mockGeneratePresignedUrl,
}))

const s3ClientMock = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../../src/services/s3Client', () => ({
  default: s3ClientMock,
}))

const sharpMock = vi.hoisted(() => {
  const chain = {
    resize: vi.fn(),
    webp: vi.fn(),
    toBuffer: vi.fn(),
  }
  const sharp = vi.fn()

  return { sharp, chain }
})

vi.mock('sharp', () => ({
  default: sharpMock.sharp,
}))

import {
  createImages,
  editImage,
  processImage,
  cancelImages,
  deleteImage,
} from '../../../src/controllers/image'

describe('Image Controller - Unit Tests', () => {
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

    sharpMock.sharp.mockReturnValue(sharpMock.chain)
    sharpMock.chain.resize.mockReturnValue(sharpMock.chain)
    sharpMock.chain.webp.mockReturnValue(sharpMock.chain)
    sharpMock.chain.toBuffer.mockReturnValueOnce(Buffer.from('thumb'))
    sharpMock.chain.toBuffer.mockReturnValueOnce(Buffer.from('full'))

    s3ClientMock.send.mockReset()
    s3ClientMock.send.mockResolvedValue({})
  })

  describe('createImages', () => {
    it('should return data from created images', async () => {
      mockRequest.body = { images: [fakeModelImage], modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelImage.createManyAndReturn.mockResolvedValue([
        { ...fakeModelImage },
      ])
      mockGeneratePresignedUrl.mockResolvedValueOnce('123')
      mockGeneratePresignedUrl.mockResolvedValueOnce('456')

      await createImages(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.modelImage.createManyAndReturn).toHaveBeenCalledTimes(1)
      expect(mockGeneratePresignedUrl).toHaveBeenCalledTimes(2)

      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith({
        images: [{ ...fakeModelImage, fullUrl: '123', thumbUrl: '456' }],
      })
    })

    it('rejects operation for unauthenticated calls', async () => {
      mockRequest.body = { images: [fakeModelImage], modelId: fakeModel.id }

      await createImages(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('should generate presigned URL for valid keys', async () => {
      mockRequest.body = {
        images: [fakeModelImage],
        modelId: 'model-id',
      }
      mockRequest.user = fakeUser

      await createImages(mockRequest as Request, mockResponse as Response)

      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(
        undefined,
        `model-id/images/${fakeModelImage.id}/full.webp`,
      )

      expect(mockGeneratePresignedUrl).toHaveBeenCalledWith(
        undefined,
        `model-id/images/${fakeModelImage.id}/thumb.webp`,
      )
    })

    it('should return 500 on prisma failure', async () => {
      mockRequest.body = {
        images: [fakeModelImage],
        modelId: 'model-id',
      }
      mockRequest.user = fakeUser

      const error = new Error('Failed to write images to database')

      prismaMock.modelImage.createManyAndReturn.mockRejectedValue(error)

      await createImages(mockRequest as Request, mockResponse as Response)

      expect(mockGeneratePresignedUrl).not.toHaveBeenCalled()
      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to create images. ERR: ${error}`,
      })
    })

    it('should return 500 on R2 failure', async () => {
      mockRequest.body = { images: [fakeModelImage], modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelImage.createManyAndReturn.mockResolvedValue([
        { ...fakeModelImage },
      ])

      const error = new Error('Failed to upload images to cloud storage')

      mockGeneratePresignedUrl.mockRejectedValueOnce(error)

      await createImages(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.modelImage.createManyAndReturn).toHaveBeenCalledTimes(1)
      expect(mockGeneratePresignedUrl).toHaveBeenCalledExactlyOnceWith(
        undefined,
        `${fakeModel.id}/images/${fakeModelImage.id}/full.webp`,
      )
      expect(mockGeneratePresignedUrl).not.toHaveBeenCalledWith(
        undefined,
        `${fakeModel.id}/images/${fakeModelImage.id}/thumb.webp`,
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to create images. ERR: ${error}`,
      })
    })
  })

  describe('deleteImage', () => {
    it('deletes image from database and cloud storage', async () => {
      mockRequest.body = { imageId: fakeModelImage.id, modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelImage.findUnique.mockResolvedValue({
        id: fakeModelImage.id,
        modelId: fakeModel.id,
      })

      await deleteImage(mockRequest as Request, mockResponse as Response)

      const [cmd] = s3ClientMock.send.mock.calls[0]

      expect(prismaMock.modelImage.delete).toHaveBeenCalledOnce()
      expect(s3ClientMock.send).toHaveBeenCalledOnce()

      expect(cmd).toBeInstanceOf(DeleteObjectsCommand)
      expect(cmd.input).toEqual({
        Bucket: undefined,
        Delete: {
          Objects: [
            { Key: `${fakeModel.id}/images/${fakeModelImage.id}/thumb.webp` },
            { Key: `${fakeModel.id}/images/${fakeModelImage.id}/full.webp` },
          ],
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Image deleted successfully',
      })
    })

    it('rejects operation for unauthenticated calls', async () => {
      mockRequest.body = { imageId: fakeModelImage.id, modelId: fakeModel.id }

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 400 when modelId is missing', async () => {
      mockRequest.body = { imageId: fakeModelImage.id }
      mockRequest.user = fakeUser

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageId are required',
      })

      expect(prismaMock.modelImage.delete).not.toHaveBeenCalledOnce()
      expect(s3ClientMock.send).not.toHaveBeenCalledOnce()
    })

    it('throws 400 when imageId is missing', async () => {
      mockRequest.body = { modelId: fakeModel.id }
      mockRequest.user = fakeUser

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageId are required',
      })

      expect(prismaMock.modelImage.delete).not.toHaveBeenCalledOnce()
      expect(s3ClientMock.send).not.toHaveBeenCalledOnce()
    })

    it('throws 404 if image does not exist in the database', async () => {
      mockRequest.body = { imageId: fakeModelImage.id, modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelImage.findUnique.mockResolvedValue(undefined)

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Image not found',
      })

      expect(prismaMock.modelImage.delete).not.toHaveBeenCalledOnce()
      expect(s3ClientMock.send).not.toHaveBeenCalledOnce()
    })

    it('throws 403 when finding a modelId mismatch', async () => {
      mockRequest.body = { imageId: fakeModelImage.id, modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelImage.findUnique.mockResolvedValue({
        id: fakeModelImage.id,
        modelId: 'different-model-id',
      })

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Mismatching model IDs',
      })

      expect(prismaMock.modelImage.delete).not.toHaveBeenCalledOnce()
      expect(s3ClientMock.send).not.toHaveBeenCalledOnce()
    })

    it('throws 500 on prisma failure', async () => {
      mockRequest.body = { imageId: fakeModelImage.id, modelId: fakeModel.id }
      mockRequest.user = fakeUser

      const error = new Error('Something went wrong')

      prismaMock.modelImage.findUnique.mockRejectedValue(error)

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to delete image. ERR: ${error}`,
      })
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.body = { imageId: fakeModelImage.id, modelId: fakeModel.id }
      mockRequest.user = fakeUser

      const error = new Error('Something went wrong')

      s3ClientMock.send.mockRejectedValueOnce(error)

      await deleteImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to delete image. ERR: ${error}`,
      })
    })
  })

  describe('editImages', () => {
    it('edits the alt, label, and description of an existing image', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      mockRequest.body = {
        modelId: fakeModel.id,
        image: {
          alt: 'image alt',
          label: 'lorem ipsum',
          description: 'lorem ipsum description',
        },
      }
      mockRequest.user = fakeUser

      prismaMock.modelImage.findUnique.mockResolvedValue({
        modelId: fakeModel.id,
      })

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(prismaMock.modelImage.update).toHaveBeenCalledWith({
        where: { id: fakeModelImage.id },
        data: {
          alt: 'image alt',
          label: 'lorem ipsum',
          description: 'lorem ipsum description',
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Image updated successfully',
      })
    })

    it('rejects operation from authenticated calls', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      mockRequest.body = {
        modelId: fakeModel.id,
        image: {
          alt: 'image alt',
          label: 'lorem ipsum',
          description: 'lorem ipsum description',
        },
      }

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 400 when id is missing in request params', async () => {
      mockRequest.params = {}
      mockRequest.body = {
        modelId: fakeModel.id,
        image: {
          alt: 'image alt',
          label: 'lorem ipsum',
          description: 'lorem ipsum description',
        },
      }
      mockRequest.user = fakeUser

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and image id are required',
      })
    })

    it('throws 400 when modelId is missing in request body', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      mockRequest.body = {
        image: {
          alt: 'image alt',
          label: 'lorem ipsum',
          description: 'lorem ipsum description',
        },
      }
      mockRequest.user = fakeUser

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and image id are required',
      })
    })
    it('throws 400 when image information is missing in request body', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      mockRequest.body = {
        modelId: fakeModel.id,
      }
      mockRequest.user = fakeUser

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No model image information provided',
      })
    })

    it('throws 403 when finding a modelId mismatch', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      mockRequest.body = {
        modelId: fakeModel.id,
        image: {
          alt: 'image alt',
          label: 'lorem ipsum',
          description: 'lorem ipsum description',
        },
      }
      mockRequest.user = fakeUser

      prismaMock.modelImage.findUnique.mockResolvedValue({
        modelId: 'different-model-id',
      })

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Mismatching model IDs',
      })
    })

    it('ignores undefined values in image information', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      mockRequest.body = {
        modelId: fakeModel.id,
        image: {
          description: 'lorem ipsum description',
        },
      }
      mockRequest.user = fakeUser

      prismaMock.modelImage.findUnique.mockResolvedValue({
        modelId: fakeModel.id,
      })

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(prismaMock.modelImage.update).toHaveBeenCalledWith({
        where: { id: fakeModelImage.id },
        data: {
          description: 'lorem ipsum description',
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Image updated successfully',
      })
    })

    it('throws 500 on prisma failure', async () => {
      mockRequest.params = { id: fakeModelImage.id }
      ;((mockRequest.body = {
        modelId: fakeModel.id,
        image: {
          description: 'lorem ipsum description',
        },
      }),
        (mockRequest.user = fakeUser))

      prismaMock.modelImage.findUnique.mockResolvedValue({
        modelId: fakeModel.id,
      })

      const error = new Error('Failed to update image')

      prismaMock.modelImage.update.mockRejectedValue(error)

      await editImage(
        mockRequest as Request<{ id: string }>,
        mockResponse as Response,
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to update image. ERR: ${error}`,
      })
    })
  })

  describe('processImage', () => {
    it('generates image files and writes files to cloud storage', async () => {
      mockRequest.file = fakeMulterFile
      mockRequest.user = fakeUser
      mockRequest.body = { modelId: fakeModel.id, imageId: fakeModelImage.id }

      await processImage(mockRequest as Request, mockResponse as Response)

      const commands = s3ClientMock.send.mock.calls.map(([cmd]) => cmd)

      expect(sharpMock.sharp).toHaveBeenCalledTimes(2)
      expect(sharpMock.sharp).toHaveBeenCalledWith(mockRequest.file.buffer)

      expect(sharpMock.chain.resize).toHaveBeenCalledTimes(2)
      expect(sharpMock.chain.resize).toHaveBeenCalledWith({ width: 400 })
      expect(sharpMock.chain.resize).toHaveBeenCalledWith({
        width: 2048,
        withoutEnlargement: true,
      })

      expect(sharpMock.chain.webp).toHaveBeenCalledTimes(2)
      expect(sharpMock.chain.webp).toHaveBeenCalledWith({ quality: 60 })
      expect(sharpMock.chain.webp).toHaveBeenCalledWith({ quality: 85 })

      expect(sharpMock.chain.toBuffer).toHaveBeenCalledTimes(2)

      expect(s3ClientMock.send).toHaveBeenCalledTimes(2)
      expect(commands).toHaveLength(2)

      commands.forEach((cmd) => expect(cmd).toBeInstanceOf(PutObjectCommand))

      expect(commands[0].input).toEqual({
        Key: `${fakeModel.id}/images/${fakeModelImage.id}/thumb.webp`,
        Body: Buffer.from('thumb'),
        ContentType: 'image/webp',
      })

      expect(commands[1].input).toEqual({
        Key: `${fakeModel.id}/images/${fakeModelImage.id}/full.webp`,
        Body: Buffer.from('full'),
        ContentType: 'image/webp',
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ message: 'Images processed' })
    })

    it('rejects operation for unauthenticated users', async () => {
      mockRequest.file = fakeMulterFile
      mockRequest.body = { modelId: fakeModel.id, imageId: fakeModelImage.id }

      await processImage(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 400 when missing file in request body', async () => {
      mockRequest.user = fakeUser
      mockRequest.body = { modelId: fakeModel.id, imageId: fakeModelImage.id }

      await processImage(mockRequest as Request, mockResponse as Response)

      expect(sharpMock.sharp).not.toHaveBeenCalled()
      expect(sharpMock.chain.resize).not.toHaveBeenCalled()
      expect(sharpMock.chain.webp).not.toHaveBeenCalled()
      expect(sharpMock.chain.toBuffer).not.toHaveBeenCalled()
      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: 'No file provided' })
    })
    it('throws 400 when missing imageId', async () => {
      mockRequest.file = fakeMulterFile
      mockRequest.user = fakeUser
      mockRequest.body = { modelId: fakeModel.id }

      await processImage(mockRequest as Request, mockResponse as Response)

      expect(sharpMock.sharp).not.toHaveBeenCalled()
      expect(sharpMock.chain.resize).not.toHaveBeenCalled()
      expect(sharpMock.chain.webp).not.toHaveBeenCalled()
      expect(sharpMock.chain.toBuffer).not.toHaveBeenCalled()
      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageId are required',
      })
    })

    it('throws 400 when missing modelId', async () => {
      mockRequest.file = fakeMulterFile
      mockRequest.user = fakeUser
      mockRequest.body = { imageId: fakeModelImage.id }

      await processImage(mockRequest as Request, mockResponse as Response)

      expect(sharpMock.sharp).not.toHaveBeenCalled()
      expect(sharpMock.chain.resize).not.toHaveBeenCalled()
      expect(sharpMock.chain.webp).not.toHaveBeenCalled()
      expect(sharpMock.chain.toBuffer).not.toHaveBeenCalled()
      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageId are required',
      })
    })
    it('prevents writing files to storage if sharp throws and error', async () => {
      mockRequest.file = fakeMulterFile
      mockRequest.user = fakeUser
      mockRequest.body = { modelId: fakeModel.id, imageId: fakeModelImage.id }

      const error = new Error('Something went wrong with Sharp.')
      sharpMock.sharp.mockRejectedValueOnce(error)

      await processImage(mockRequest as Request, mockResponse as Response)

      expect(sharpMock.sharp).toHaveBeenCalledTimes(1)
      expect(sharpMock.sharp).toHaveBeenCalledWith(mockRequest.file.buffer)
      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(500)
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.file = fakeMulterFile
      mockRequest.user = fakeUser
      mockRequest.body = { modelId: fakeModel.id, imageId: fakeModelImage.id }

      const error = new Error('Something went wrong with Sharp.')
      s3ClientMock.send.mockRejectedValueOnce(error)

      await processImage(mockRequest as Request, mockResponse as Response)

      expect(sharpMock.sharp).toHaveBeenCalledTimes(2)
      expect(sharpMock.sharp).toHaveBeenCalledWith(mockRequest.file.buffer)

      expect(sharpMock.chain.resize).toHaveBeenCalledTimes(2)
      expect(sharpMock.chain.resize).toHaveBeenCalledWith({ width: 400 })
      expect(sharpMock.chain.resize).toHaveBeenCalledWith({
        width: 2048,
        withoutEnlargement: true,
      })

      expect(sharpMock.chain.webp).toHaveBeenCalledTimes(2)
      expect(sharpMock.chain.webp).toHaveBeenCalledWith({ quality: 60 })
      expect(sharpMock.chain.webp).toHaveBeenCalledWith({ quality: 85 })

      expect(sharpMock.chain.toBuffer).toHaveBeenCalledTimes(2)

      expect(s3ClientMock.send).toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to process image. ERR: ${error}`,
      })
    })
  })

  describe('cancelImages', () => {
    it('sends a single DeleteObjectsCommand with two keys per ID', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        imageIds: ['image-id-0', 'image-id-1'],
      }
      mockRequest.user = fakeUser

      await cancelImages(mockRequest as Request, mockResponse as Response)

      const [cmd] = s3ClientMock.send.mock.calls[0]

      expect(s3ClientMock.send).toHaveBeenCalledOnce()

      expect(cmd).toBeInstanceOf(DeleteObjectsCommand)
      expect(cmd.input).toEqual({
        Bucket: undefined,
        Delete: {
          Objects: [
            { Key: `${fakeModel.id}/images/image-id-0/thumb.webp` },
            { Key: `${fakeModel.id}/images/image-id-0/full.webp` },
            { Key: `${fakeModel.id}/images/image-id-1/thumb.webp` },
            { Key: `${fakeModel.id}/images/image-id-1/full.webp` },
          ],
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Images cleaned up successfully',
      })
    })

    it('rejects operation for unauthorized calls', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        imageIds: ['image-id-0', 'image-id-1'],
      }

      await cancelImages(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 400 when missing modelId', async () => {
      mockRequest.body = {
        imageIds: ['image-id-0', 'image-id-1'],
      }
      mockRequest.user = fakeUser

      await cancelImages(mockRequest as Request, mockResponse as Response)

      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageIds are required',
      })
    })
    it('throws 400 if imageIds is not an array', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        imageIds: 'image-id-0',
      }
      mockRequest.user = fakeUser

      await cancelImages(mockRequest as Request, mockResponse as Response)

      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageIds are required',
      })
    })

    it('throws 400 if imageIds is empty', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        imageIds: [],
      }
      mockRequest.user = fakeUser

      await cancelImages(mockRequest as Request, mockResponse as Response)

      expect(s3ClientMock.send).not.toHaveBeenCalled()

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and imageIds are required',
      })
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        imageIds: ['image-id-0', 'image-id-1'],
      }
      mockRequest.user = fakeUser

      const error = new Error('Something went wrong')
      s3ClientMock.send.mockRejectedValueOnce(error)

      await cancelImages(mockRequest as Request, mockResponse as Response)

      const [cmd] = s3ClientMock.send.mock.calls[0]

      expect(s3ClientMock.send).toHaveBeenCalledOnce()

      expect(cmd).toBeInstanceOf(DeleteObjectsCommand)
      expect(cmd.input).toEqual({
        Bucket: undefined,
        Delete: {
          Objects: [
            { Key: `${fakeModel.id}/images/image-id-0/thumb.webp` },
            { Key: `${fakeModel.id}/images/image-id-0/full.webp` },
            { Key: `${fakeModel.id}/images/image-id-1/thumb.webp` },
            { Key: `${fakeModel.id}/images/image-id-1/full.webp` },
          ],
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to clean up images. ERR: ${error}`,
      })
    })
  })
})
