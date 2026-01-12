import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { fakeUser } from '../../fixtures/fakes'

const mockGenerateSessionToken = vi.hoisted(() => vi.fn())
const mockCreateSession = vi.hoisted(() => vi.fn())
const mockSetSessionTokenCookie = vi.hoisted(() => vi.fn())
const mockDeleteSessionTokenCookie = vi.hoisted(() => vi.fn())
const mockOneTimeCodeTransaction = vi.hoisted(() => vi.fn())
const mockInvalidateSession = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/auth', () => ({
  generateSessionToken: mockGenerateSessionToken,
  createSession: mockCreateSession,
  setSessionTokenCookie: mockSetSessionTokenCookie,
  deleteSessionTokenCookie: mockDeleteSessionTokenCookie,
  oneTimeCodeTransaction: mockOneTimeCodeTransaction,
  invalidateSession: mockInvalidateSession,
}))

const prismaMock = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

import {
  getCurrentUser,
  getAllUsers,
  patchUser,
  patchUsers,
  exchangeOneTimeCode,
  deleteUserSession,
} from '../../../src/controllers/user'
import { permission } from 'process'

describe('User Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockJson = vi.fn()
    mockSend = vi.fn()
    mockStatus = vi.fn().mockReturnValue({
      json: mockJson,
      send: mockSend,
    })

    mockRequest = {
      body: {},
      cookies: {},
    }

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
    } as unknown as Response
  })

  describe('getCurrentUser', () => {
    it('should return user data from the request payload', async () => {
      mockRequest.user = fakeUser

      await getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockJson).toHaveBeenCalledWith({ user: fakeUser })
    })

    it('should reject non authenticated requests', async () => {
      mockRequest.user = undefined

      await getCurrentUser(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        user: null,
        message: 'Not authenticated',
      })
    })
  })

  describe('getAllUsers', () => {
    it('should return all users and their model count', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser

      const users = [
        {
          ...fakeUser,
          _count: { models: 5 },
        },
        {
          id: 8,
          casId: 'cas123',
          displayName: 'User Two',
          _count: { models: 3 },
        },
      ]

      prismaMock.user.findMany.mockResolvedValue(users)

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        include: {
          _count: {
            select: {
              models: true,
            },
          },
        },
        orderBy: {
          displayName: 'asc',
        },
      })
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ users })
    })

    it('should reject non authenticated requests', async () => {
      mockRequest.user = undefined

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith(
        'Not authorized to access the requested resource',
      )
      expect(prismaMock.user.findMany).not.toHaveBeenCalled()
    })

    it('should reject requests from non-admin users', async () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith(
        'Not authorized to access the requested resource',
      )
      expect(prismaMock.user.findMany).not.toHaveBeenCalled()
    })

    it('should handle database search errors', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser

      const error = new Error('Database connection failed')
      prismaMock.user.findMany.mockRejectedValue(error)

      await getAllUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Failed to retrieve user')
    })
  })

  describe('patchUser', () => {
    it('should update the user display name', async () => {
      mockRequest.user = fakeUser
      mockRequest.body = { displayName: 'New Display Name' }

      const updatedUser = { ...fakeUser, displayName: 'New Display Name' }
      prismaMock.user.update.mockResolvedValue(updatedUser)

      await patchUser(mockRequest as Request, mockResponse as Response, vi.fn())

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: fakeUser.id },
        data: { displayName: 'New Display Name' },
      })

      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ displayName: 'New Display Name' })
    })

    it('should reject non authenticated requests', async () => {
      mockRequest.user = undefined
      mockRequest.body = { displayName: 'New Name' }

      await patchUser(mockRequest as Request, mockResponse as Response, vi.fn())

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('Not authenticated')
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should reject invalid display name values', async () => {
      mockRequest.user = fakeUser
      mockRequest.body = { displayName: '' }

      await patchUser(mockRequest as Request, mockResponse as Response, vi.fn())

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Missing user display name')
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should reject missing display name', async () => {
      mockRequest.user = fakeUser
      mockRequest.body = {}

      await patchUser(mockRequest as Request, mockResponse as Response, vi.fn())

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Missing user display name')
      expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('should handle database update errors', async () => {
      mockRequest.user = fakeUser
      mockRequest.body = { displayName: 'New Name' }

      const error = new Error('Database update failed')
      prismaMock.user.update.mockRejectedValue(error)

      await patchUser(mockRequest as Request, mockResponse as Response, vi.fn())

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Failed to update user')
    })
  })

  describe('patchUsers', () => {
    it('should update display names and permissions for multiple users', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser

      const changedUsers = [
        { id: 'user-1', displayName: 'Updated User 1', permissions: 'FULL' },
        {
          id: 'user-2',
          displayName: 'Updated User 2',
          permissions: 'STANDARD',
        },
      ]

      mockRequest.body = { changedUsers }

      const updatedUsers = [
        {
          id: 'user-1',
          displayName: 'Updated User 1',
          permissions: 'FULL',
          _count: { models: 5 },
        },
        {
          id: 'user-2',
          displayName: 'Updated User 2',
          permissions: 'STANDARD',
          _count: { models: 3 },
        },
      ]

      prismaMock.$transaction.mockResolvedValue(updatedUsers)

      await patchUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ updated: updatedUsers })
    })

    it('should reject non authenticated requests', async () => {
      mockRequest.user = undefined
      mockRequest.body = { changedUsers: [] }

      await patchUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith(
        'Not authorized to access the requested resource',
      )
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should reject requests from non-admin users', async () => {
      const standardUser = { ...fakeUser, permissions: 'STANDARD' as const }
      mockRequest.user = standardUser
      mockRequest.body = { changedUsers: [] }

      await patchUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith(
        'Not authorized to access the requested resource',
      )
      expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('should reject requests with missing changed users', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser
      mockRequest.body = {}

      await patchUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Missing or invalid updated users')
    })

    it('should reject requests with non-array changed users', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser
      mockRequest.body = { changedUsers: 'not-an-array' }

      await patchUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Missing or invalid updated users')
    })

    it('should handle database update errors', async () => {
      const adminUser = { ...fakeUser, permissions: 'ADMIN' as const }
      mockRequest.user = adminUser
      mockRequest.body = {
        changedUsers: [
          { id: 'user-1', displayName: 'Test Name', permissions: 'FULL' },
        ],
      }

      const error = new Error('Transaction failed')
      prismaMock.$transaction.mockRejectedValue(error)

      await patchUsers(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Failed to update users')
    })
  })

  describe('exchangeOneTimeCode', () => {
    it('should accept and consume valid OTCs', async () => {
      const otc = 'valid-otc-12345'
      mockRequest.body = { otc }

      const otcRecord = {
        code: otc,
        userId: fakeUser.id,
        expiresAt: new Date(),
      }
      mockOneTimeCodeTransaction.mockResolvedValue(otcRecord)

      const sessionToken = 'session-token-abc123'
      mockGenerateSessionToken.mockReturnValue(sessionToken)

      const session = {
        id: 'session-id',
        userId: fakeUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      }
      mockCreateSession.mockResolvedValue(session)

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockOneTimeCodeTransaction).toHaveBeenCalledWith(otc)
      expect(mockJson).toHaveBeenCalledWith({ success: true })
    })

    it('should generate a session token', async () => {
      const otc = 'valid-otc-12345'
      mockRequest.body = { otc }

      mockOneTimeCodeTransaction.mockResolvedValue({
        code: otc,
        userId: fakeUser.id,
        expiresAt: new Date(),
      })
      mockGenerateSessionToken.mockReturnValue('new-session-token')
      mockCreateSession.mockResolvedValue({
        id: 'session-id',
        userId: fakeUser.id,
        expiresAt: new Date(),
      })

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockGenerateSessionToken).toHaveBeenCalledTimes(1)
    })

    it('should create a session in the database', async () => {
      const otc = 'valid-otc-12345'
      const sessionToken = 'session-token-abc'
      mockRequest.body = { otc }

      mockOneTimeCodeTransaction.mockResolvedValue({
        code: otc,
        userId: fakeUser.id,
        expiresAt: new Date(),
      })
      mockGenerateSessionToken.mockReturnValue(sessionToken)
      mockCreateSession.mockResolvedValue({
        id: 'session-id',
        userId: fakeUser.id,
        expiresAt: new Date(),
      })

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockCreateSession).toHaveBeenCalledWith(sessionToken, fakeUser.id)
    })

    it('should set the session token cookie', async () => {
      const otc = 'valid-otc-12345'
      const sessionToken = 'session-token-abc'
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)

      mockRequest.body = { otc }

      mockOneTimeCodeTransaction.mockResolvedValue({
        code: otc,
        userId: fakeUser.id,
        expiresAt: new Date(),
      })
      mockGenerateSessionToken.mockReturnValue(sessionToken)
      mockCreateSession.mockResolvedValue({
        id: 'session-id',
        userId: fakeUser.id,
        expiresAt,
      })

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockSetSessionTokenCookie).toHaveBeenCalledWith(
        mockResponse,
        sessionToken,
        expiresAt,
      )
    })

    it('should reject missing OTC', async () => {
      mockRequest.body = {}

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Missing OTC')
      expect(mockOneTimeCodeTransaction).not.toHaveBeenCalled()
    })

    it('should reject invalid or expired OTC', async () => {
      const otc = 'invalid-otc'
      mockRequest.body = { otc }

      const error = new Error('Invalid or expired code')
      mockOneTimeCodeTransaction.mockRejectedValue(error)

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith(
        expect.stringContaining('Failed to exchange OTC'),
      )
    })

    it('should handle transaction errors', async () => {
      const otc = 'valid-otc'
      mockRequest.body = { otc }

      mockOneTimeCodeTransaction.mockResolvedValue({
        code: otc,
        userId: fakeUser.id,
        expiresAt: new Date(),
      })
      mockGenerateSessionToken.mockReturnValue('token')

      const error = new Error('Database transaction failed')
      mockCreateSession.mockRejectedValue(error)

      await exchangeOneTimeCode(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith(
        expect.stringContaining('Failed to exchange OTC'),
      )
    })
  })

  describe('deleteUserSession', () => {
    it('should delete the session from the database', async () => {
      const sessionToken = 'session-token-abc123'
      mockRequest.cookies = { session: sessionToken }

      mockInvalidateSession.mockResolvedValue(undefined)

      await deleteUserSession(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockInvalidateSession).toHaveBeenCalledWith(sessionToken)
    })

    it('should delete the session token cookie', async () => {
      const sessionToken = 'session-token-abc123'
      mockRequest.cookies = { session: sessionToken }

      mockInvalidateSession.mockResolvedValue(undefined)

      await deleteUserSession(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockDeleteSessionTokenCookie).toHaveBeenCalledWith(mockResponse)
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ message: 'Logout successful' })
    })

    it('should reject requests without a token cookie', async () => {
      mockRequest.cookies = {}

      await deleteUserSession(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({
        user: null,
        message: 'No session token',
      })
      expect(mockInvalidateSession).not.toHaveBeenCalled()
    })

    it('should handle session deletion errors', async () => {
      const sessionToken = 'session-token-abc123'
      mockRequest.cookies = { session: sessionToken }

      const error = new Error('Failed to delete session')
      mockInvalidateSession.mockRejectedValue(error)

      await deleteUserSession(
        mockRequest as Request,
        mockResponse as Response,
        vi.fn(),
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Internal server error',
        error,
      })
    })
  })
})
