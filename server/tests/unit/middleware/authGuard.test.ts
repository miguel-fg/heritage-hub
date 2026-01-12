import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextFunction, Request, Response } from 'express'
import { fakeUser } from '../../fixtures/fakes'

const mockValidateSessionToken = vi.hoisted(() => vi.fn())
const mockDeleteSessionTokenCookie = vi.hoisted(() => vi.fn())
const mockSetSessionTokenCookie = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/auth', () => ({
  validateSessionToken: mockValidateSessionToken,
  deleteSessionTokenCookie: mockDeleteSessionTokenCookie,
  setSessionTokenCookie: mockSetSessionTokenCookie,
}))

import { authGuard } from '../../../src/middleware/authGuard'

describe('AuthGuard Middleware - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockJson = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ json: mockJson })
    mockNext = vi.fn()

    mockRequest = {
      cookies: {},
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response
  })

  it('should allow requests with valid session tokens', async () => {
    const validToken = 'valid-token-123'
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    const session = {
      id: 'session-id',
      userId: fakeUser.id,
      expiresAt,
    }

    mockRequest.cookies = { session: validToken }

    mockValidateSessionToken.mockResolvedValue({
      session,
      user: fakeUser,
    })

    await authGuard(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockValidateSessionToken).toHaveBeenCalledWith(validToken)
    expect(mockSetSessionTokenCookie).toHaveBeenCalledWith(
      mockResponse,
      validToken,
      expiresAt,
    )
    expect(mockRequest.user).toEqual(fakeUser)
    expect(mockNext).toHaveBeenCalledTimes(1)
  })

  it('should block requests with invalid session tokens', async () => {
    const invalidToken = 'invalid-token-123'
    mockRequest.cookies = { session: invalidToken }

    mockValidateSessionToken.mockResolvedValue({
      session: null,
      user: null,
    })

    await authGuard(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockValidateSessionToken).toHaveBeenCalledWith(invalidToken)
    expect(mockDeleteSessionTokenCookie).toHaveBeenCalledWith(mockResponse)
    expect(mockStatus).toHaveBeenCalledWith(401)
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Unauthorized: Invalid session token',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should block requests without a session token', async () => {
    mockRequest.cookies = {}

    await authGuard(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockStatus).toHaveBeenCalledWith(401)
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Unauthorized: No session token',
    })
    expect(mockValidateSessionToken).not.toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should handle validation errors gracefully', async () => {
    const validToken = 'valid-token-123'
    mockRequest.cookies = { session: validToken }

    const error = new Error('Database connection failed')
    mockValidateSessionToken.mockRejectedValue(error)

    await authGuard(mockRequest as Request, mockResponse as Response, mockNext)

    expect(mockStatus).toHaveBeenCalledWith(500)
    expect(mockJson).toHaveBeenCalledWith({
      message: 'Internal server error',
    })
    expect(mockNext).not.toHaveBeenCalled()
  })
})
