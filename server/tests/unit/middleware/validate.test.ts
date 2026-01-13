import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextFunction, Request, Response } from 'express'
import { z, ZodError } from 'zod'
import { fakeUser } from '../../fixtures/fakes'

const prismaMock = vi.hoisted(() => ({
  model: {
    findUnique: vi.fn(),
  },
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

import {
  validateBody,
  validateUploadPermissions,
  validateModifyPermissions,
} from '../../../src/middleware/validate'

describe('Validate Middleware - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockSend = vi.fn()
    mockJson = vi.fn()
    mockNext = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ send: mockSend, json: mockJson })

    mockRequest = {
      body: {},
      params: {},
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    } as unknown as Response
  })

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string(),
      email: z.string().email(),
      age: z.number().min(0),
    })

    it('should pass validation with valid data', () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      }

      const middleware = validateBody(testSchema)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block invalid data with ZodError', () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: -5,
      }

      const middleware = validateBody(testSchema)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid request body',
        issues: expect.any(Array),
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should pass non-ZodError to next middleware', () => {
      const errorThrowingSchema = {
        parse: () => {
          throw new Error('Non-Zod error')
        },
      } as unknown as z.ZodSchema

      mockRequest.body = {}

      const middleware = validateBody(errorThrowingSchema)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error))
      expect(mockStatus).not.toHaveBeenCalled()
    })

    it('should reject missing required fields', () => {
      mockRequest.body = {
        name: 'John Doe',
      }

      const middleware = validateBody(testSchema)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid request body',
        issues: expect.any(Array),
      })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject extra fields with strict schema', () => {
      const strictSchema = z
        .object({
          name: z.string(),
        })
        .strict()

      mockRequest.body = {
        name: 'John Doe',
        extraField: 'should fail',
      }

      const middleware = validateBody(strictSchema)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('validateUploadPermissions', () => {
    it('should allow users with STANDARD permissions', () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser

      validateUploadPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should allow users with FULL permissions', () => {
      const standardUser = { ...fakeUser, permissions: 'FULL' as const }
      mockRequest.user = standardUser

      validateUploadPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should allow users with ADMIN permissions', () => {
      const standardUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = standardUser

      validateUploadPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block users with RESTRICTED permissions', () => {
      const standardUser = { ...fakeUser, permissions: 'RESTRICTED' as const }
      mockRequest.user = standardUser

      validateUploadPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Forbidden: Cannot upload models')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block unauthenticated requests', () => {
      mockRequest.user = undefined

      validateUploadPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
      expect(mockNext).not.toHaveBeenCalled()
    })
  })

  describe('validateModifyPermissions', () => {
    const modelId = 'test-model-123'

    it('should allow ADMIN users without checking ownership', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser
      mockRequest.params = { id: modelId }

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(prismaMock.model.findUnique).not.toHaveBeenCalled()
    })

    it('should allow FULL users without checking ownership', async () => {
      const adminUser = { ...fakeUser, permissions: 'FULL' as const }
      mockRequest.user = adminUser
      mockRequest.params = { id: modelId }

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(prismaMock.model.findUnique).not.toHaveBeenCalled()
    })

    it('should allow STANDARD users who own the model', async () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser
      mockRequest.params = { id: modelId }

      prismaMock.model.findUnique.mockResolvedValue({
        id: modelId,
        ownerId: standardUser.id,
      })

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(prismaMock.model.findUnique).toHaveBeenCalledWith({
        where: { id: modelId },
        select: { ownerId: true },
      })
      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block STANDARD users who do not own the model', async () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser
      mockRequest.params = { id: modelId }

      prismaMock.model.findUnique.mockResolvedValue({
        id: modelId,
        ownerId: 'different-user-id',
      })

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith(
        "Forbidden: You don't own this model",
      )
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block STANDARD users when model does not exist', async () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser
      mockRequest.params = { id: modelId }

      prismaMock.model.findUnique.mockResolvedValue(null)

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockSend).toHaveBeenCalledWith('Model not found')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block RESTRICTED users', async () => {
      const restrictedUser = { ...fakeUser, permissions: 'RESTRICTED' as const }
      mockRequest.user = restrictedUser
      mockRequest.params = { id: modelId }

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Forbidden: Cannot modify models')
      expect(mockNext).not.toHaveBeenCalled()
      expect(prismaMock.model.findUnique).not.toHaveBeenCalled()
    })

    it('should block unauthenticated requests', async () => {
      mockRequest.user = undefined
      mockRequest.params = { id: modelId }

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Unauthorized')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser
      mockRequest.params = { id: modelId }

      const error = new Error('Database connection failed')
      prismaMock.model.findUnique.mockRejectedValue(error)

      await validateModifyPermissions(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Internal server error')
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
