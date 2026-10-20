import { ENV } from '../../env'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import {
  fakeModel,
  fakeModelPDF,
  fakeMulterPDFFile,
  fakeUser,
} from '../fixtures/fakes'
import {
  PutObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'

const prismaMock = vi.hoisted(() => ({
  modelPdfs: {
    createManyAndReturn: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../src/services/prisma', () => ({
  default: prismaMock,
}))

const mockGenerateFilePresignedUrl = vi.hoisted(() => vi.fn())

vi.mock('../../src/scripts/r2Storage', () => ({
  generateFilePresignedUrl: mockGenerateFilePresignedUrl,
}))

const s3ClientMock = vi.hoisted(() => ({
  send: vi.fn().mockResolvedValue({}),
}))

vi.mock('../../src/services/s3Client', () => ({
  default: s3ClientMock,
}))

import {
  createPdfs,
  deletePdf,
  processPdf,
  cancelPdfs,
} from '../../src/controllers/pdf'

describe('PDF Controller - Unit Tests', () => {
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

    s3ClientMock.send.mockReset()
    s3ClientMock.send.mockResolvedValue({})
  })

  describe('createPdfs', () => {
    it('returns data from created pdfs', async () => {
      mockRequest.body = { pdfs: [fakeModelPDF], modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.createManyAndReturn.mockResolvedValue([
        { ...fakeModelPDF },
      ])

      mockGenerateFilePresignedUrl.mockResolvedValue('pdf-url')

      await createPdfs(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.modelPdfs.createManyAndReturn).toHaveBeenCalledTimes(1)
      expect(mockGenerateFilePresignedUrl).toHaveBeenCalledTimes(1)

      expect(mockStatus).toHaveBeenCalledWith(201)
      expect(mockJson).toHaveBeenCalledWith({
        pdfs: [{ ...fakeModelPDF, url: 'pdf-url' }],
      })
    })

    it('rejects operation for unauthenticated calls', async () => {
      mockRequest.body = { pdfs: [fakeModelPDF], modelId: fakeModel.id }

      await createPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('generates presigned URL for valid keys', async () => {
      mockRequest.body = {
        pdfs: [
          { ...fakeModelPDF, id: 'pdf-1', title: 'report.pdf' },
          { ...fakeModelPDF, id: 'pdf-2', title: undefined },
        ],
        modelId: fakeModel.id,
      }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.createManyAndReturn.mockResolvedValue([
        { ...fakeModelPDF, id: 'pdf-1', title: 'report.pdf' },
        { ...fakeModelPDF, id: 'pdf-2', title: undefined },
      ])

      mockGenerateFilePresignedUrl.mockResolvedValue('pdf-url')

      await createPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockGenerateFilePresignedUrl).toHaveBeenCalledTimes(2)

      expect(mockGenerateFilePresignedUrl).toHaveBeenNthCalledWith(
        1,
        ENV.CLOUDFLARE_R2_BUCKET_NAME,
        `${fakeModel.id}/pdfs/pdf-1.pdf`,
        'report.pdf',
      )

      expect(mockGenerateFilePresignedUrl).toHaveBeenNthCalledWith(
        2,
        ENV.CLOUDFLARE_R2_BUCKET_NAME,
        `${fakeModel.id}/pdfs/pdf-2.pdf`,
        'article.pdf',
      )
    })

    it('throws 500 on prisma failure', async () => {
      mockRequest.body = { pdfs: [fakeModelPDF], modelId: fakeModel.id }
      mockRequest.user = fakeUser

      const error = new Error('db down')
      prismaMock.modelPdfs.createManyAndReturn.mockRejectedValue(error)

      await createPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to create PDFs. ERR: ${error}`,
      })
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.body = { pdfs: [fakeModelPDF], modelId: fakeModel.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.createManyAndReturn.mockResolvedValue([fakeModelPDF])

      const error = new Error('R2 down')
      mockGenerateFilePresignedUrl.mockRejectedValue(error)

      await createPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to create PDFs. ERR: ${error}`,
      })
    })
  })

  describe('deletePdf', () => {
    it('deletes pdf from database and cloud storage', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.findUnique.mockResolvedValue({
        id: fakeModelPDF.id,
        modelId: fakeModelPDF.modelId,
      })

      await deletePdf(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.modelPdfs.delete).toHaveBeenCalledTimes(1)
      expect(prismaMock.modelPdfs.delete).toHaveBeenCalledWith({
        where: { id: fakeModelPDF.id },
      })

      const [cmd] = s3ClientMock.send.mock.calls[0]
      expect(s3ClientMock.send).toHaveBeenCalledTimes(1)
      expect(cmd).toBeInstanceOf(DeleteObjectCommand)
      expect(cmd.input).toEqual({
        Bucket: ENV.CLOUDFLARE_R2_BUCKET_NAME,
        Key: `${fakeModel.id}/pdfs/${fakeModelPDF.id}.pdf`,
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'PDF file deleted successfully',
      })
    })

    it('rejects operation for unauthenticated calls', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }

      await deletePdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 404 if no PDF is found', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.findUnique.mockResolvedValue(null)

      await deletePdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: 'PDF file not found' })
    })

    it('throws 403 when finding a modelId mismatch', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.findUnique.mockResolvedValue({
        id: fakeModelPDF.id,
        modelId: 'different-model-id',
      })

      await deletePdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockJson).toHaveBeenCalledWith({ error: 'Mismatching model IDs' })
    })

    it('throws 500 on prisma failure', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.findUnique.mockResolvedValue({
        id: fakeModelPDF.id,
        modelId: fakeModelPDF.modelId,
      })

      const error = new Error('db down')
      prismaMock.modelPdfs.delete.mockRejectedValueOnce(error)

      await deletePdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to delete PDF file. ERR: ${error}`,
      })
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.user = fakeUser

      prismaMock.modelPdfs.findUnique.mockResolvedValue({
        id: fakeModelPDF.id,
        modelId: fakeModelPDF.modelId,
      })

      const error = new Error('R2 down')

      s3ClientMock.send.mockRejectedValueOnce(error)

      await deletePdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to delete PDF file. ERR: ${error}`,
      })
    })
  })

  describe('processPdf', () => {
    it('writes pdf file to cloud storage', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.file = fakeMulterPDFFile
      mockRequest.user = fakeUser

      await processPdf(mockRequest as Request, mockResponse as Response)

      const [cmd] = s3ClientMock.send.mock.calls[0]
      expect(s3ClientMock.send).toHaveBeenCalledTimes(1)
      expect(cmd).toBeInstanceOf(PutObjectCommand)
      expect(cmd.input).toEqual({
        Bucket: ENV.CLOUDFLARE_R2_BUCKET_NAME,
        Key: `${fakeModel.id}/pdfs/${fakeModelPDF.id}.pdf`,
        Body: mockRequest.file!.buffer,
        ContentType: 'application/pdf',
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ message: 'PDFs processed' })
    })

    it('rejects operation for unauthenticated calls', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.file = fakeMulterPDFFile

      await processPdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 400 when missing file in request body', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.user = fakeUser

      await processPdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'No file provided',
      })
    })

    it('throws 400 when missing pdfId', async () => {
      mockRequest.body = { modelId: fakeModel.id }
      mockRequest.file = fakeMulterPDFFile
      mockRequest.user = fakeUser

      await processPdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and pdfId are required',
      })
    })

    it('throws 400 when missing modelId', async () => {
      mockRequest.body = { pdfId: fakeModelPDF.id }
      mockRequest.file = fakeMulterPDFFile
      mockRequest.user = fakeUser

      await processPdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and pdfId are required',
      })
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.body = { modelId: fakeModel.id, pdfId: fakeModelPDF.id }
      mockRequest.file = fakeMulterPDFFile
      mockRequest.user = fakeUser

      const error = new Error('R2 down')
      s3ClientMock.send.mockRejectedValue(error)

      await processPdf(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to process PDF. ERR: ${error}`,
      })
    })
  })

  describe('cancelPdfs', () => {
    it('deletes processed PDFs from R2', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        pdfIds: ['pdf-1', 'pdf-2', 'pdf-3'],
      }
      mockRequest.user = fakeUser

      await cancelPdfs(mockRequest as Request, mockResponse as Response)

      const [cmd] = s3ClientMock.send.mock.calls[0]
      expect(s3ClientMock.send).toHaveBeenCalledTimes(1)
      expect(cmd).toBeInstanceOf(DeleteObjectsCommand)
      expect(cmd.input).toEqual({
        Bucket: ENV.CLOUDFLARE_R2_BUCKET_NAME,
        Delete: {
          Objects: [
            { Key: `${fakeModel.id}/pdfs/pdf-1.pdf` },
            { Key: `${fakeModel.id}/pdfs/pdf-2.pdf` },
            { Key: `${fakeModel.id}/pdfs/pdf-3.pdf` },
          ],
        },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'PDFs cleaned up successfully',
      })
    })

    it('rejects operation for unauthenticated calls', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        pdfIds: ['pdf-1', 'pdf-2', 'pdf-3'],
      }

      await cancelPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
    })

    it('throws 400 when missing modelId', async () => {
      mockRequest.body = {
        pdfIds: ['pdf-1', 'pdf-2', 'pdf-3'],
      }
      mockRequest.user = fakeUser

      await cancelPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and pdfIds are required',
      })
    })

    it('throws 400 if pdfIds is not an array', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        pdfIds: 'pdf-1',
      }
      mockRequest.user = fakeUser

      await cancelPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and pdfIds are required',
      })
    })

    it('throws 400 if pdfIds is empty', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        pdfIds: [],
      }
      mockRequest.user = fakeUser

      await cancelPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'modelId and pdfIds are required',
      })
    })

    it('throws 500 on R2 failure', async () => {
      mockRequest.body = {
        modelId: fakeModel.id,
        pdfIds: ['pdf-1', 'pdf-2', 'pdf-3'],
      }
      mockRequest.user = fakeUser

      const error = new Error('R2 down')
      s3ClientMock.send.mockRejectedValue(error)

      await cancelPdfs(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: `[server]: Failed to clean up PDFs. ERR: ${error}`,
      })
    })
  })
})
