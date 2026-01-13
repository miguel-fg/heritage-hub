import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'

const mockGetCASServiceURL = vi.hoisted(() => vi.fn())
const mockGetFrontendURL = vi.hoisted(() => vi.fn())
const mockCreateOneTimeCode = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/auth', () => ({
  getCASServiceURL: mockGetCASServiceURL,
  getFrontendURL: mockGetFrontendURL,
  createOneTimeCode: mockCreateOneTimeCode,
}))

const mockAxiosGet = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({
  default: {
    get: mockAxiosGet,
  },
}))

const mockParseStringPromise = vi.hoisted(() => vi.fn())
vi.mock('xml2js', () => ({
  parseStringPromise: mockParseStringPromise,
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => 'test-uuid-1234'),
}))

const prismaMock = vi.hoisted(() => ({
  user: {
    upsert: vi.fn(),
  },
}))
vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

import { redirectCAS, validateCASTicket } from '../../../src/controllers/auth'

describe('Auth Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>
  let mockRedirect: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockJson = vi.fn()
    mockSend = vi.fn()
    mockRedirect = vi.fn()
    mockStatus = vi.fn().mockReturnValue({
      json: mockJson,
      send: mockSend,
    })

    mockRequest = {}
    mockResponse = {
      status: mockStatus,
      json: mockJson,
      send: mockSend,
      redirect: mockRedirect,
    } as unknown as Response
  })

  describe('redirectCAS', () => {
    it('should redirect to CAS login with service URL', () => {
      const serviceURL = 'https://heritage-hub.ca/api/cas/callback'
      mockGetCASServiceURL.mockReturnValue(serviceURL)

      redirectCAS(mockRequest as Request, mockResponse as Response)

      expect(mockGetCASServiceURL).toHaveBeenCalledTimes(1)
      expect(mockRedirect).toHaveBeenCalledWith(
        `https://cas.sfu.ca/cas/login?service=${encodeURIComponent(serviceURL)}`,
      )
    })

    it('should return error when service URL is not configured', () => {
      mockGetCASServiceURL.mockReturnValue(null)

      redirectCAS(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('CAS service URLs not configured.'),
      })
      expect(mockRedirect).not.toHaveBeenCalled()
    })
  })

  describe('validateCASTicket', () => {
    const serviceURL = 'https://heritage-hub.ca/api/cas/callback'
    const frontendURL = 'https://heritage-hub.ca'
    const ticket = 'ST-12345-abcdefghijklmnop'
    const casId = 'testuser'
    const authType = 'sfu'

    beforeEach(() => {
      mockGetCASServiceURL.mockReturnValue(serviceURL)
      mockGetFrontendURL.mockReturnValue(frontendURL)
    })

    it('should validate ticket and redirect with OTC for existing user', async () => {
      mockRequest.query = { ticket }

      const casResponse = `
        <cas:serviceResponse>
          <cas:authenticationSuccess>
            <cas:user>${casId}</cas:user>
            <cas:authtype>${authType}</cas:authtype>
          </cas:authenticationSuccess>
        </cas:serviceResponse>
      `

      mockAxiosGet.mockResolvedValue({ data: casResponse })

      mockParseStringPromise.mockResolvedValue({
        'cas:serviceResponse': {
          'cas:authenticationSuccess': {
            'cas:user': casId,
            'cas:authtype': authType,
          },
        },
      })

      const existingUser = {
        id: 'existing-user-id',
        casId,
        authType,
      }

      prismaMock.user.upsert.mockResolvedValue(existingUser)
      mockCreateOneTimeCode.mockResolvedValue('otc-67890')

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://cas.sfu.ca/cas/serviceValidate?service=${encodeURIComponent(serviceURL)}&ticket=${encodeURIComponent(ticket)}`,
      )

      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { casId },
        create: { id: 'test-uuid-1234', casId, authType },
        update: { authType },
      })
      expect(mockCreateOneTimeCode).toHaveBeenCalledWith('existing-user-id')
      expect(mockRedirect).toHaveBeenCalledWith(
        `${frontendURL}/auth/callback?otc=otc-67890`,
      )
    })

    it('should validate ticket and redirect with OTC for new user', async () => {
      mockRequest.query = { ticket }

      const casResponse = `
        <cas:serviceResponse>
          <cas:authenticationSuccess>
            <cas:user>${casId}</cas:user>
            <cas:authtype>${authType}</cas:authtype>
          </cas:authenticationSuccess>
        </cas:serviceResponse>
      `

      mockAxiosGet.mockResolvedValue({ data: casResponse })

      mockParseStringPromise.mockResolvedValue({
        'cas:serviceResponse': {
          'cas:authenticationSuccess': {
            'cas:user': casId,
            'cas:authtype': authType,
          },
        },
      })

      const newUser = {
        id: 'test-uuid-1234',
        casId,
        authType,
      }

      prismaMock.user.upsert.mockResolvedValue(newUser)
      mockCreateOneTimeCode.mockResolvedValue('otc-12345')

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockAxiosGet).toHaveBeenCalledWith(
        `https://cas.sfu.ca/cas/serviceValidate?service=${encodeURIComponent(serviceURL)}&ticket=${encodeURIComponent(ticket)}`,
      )

      expect(mockParseStringPromise).toHaveBeenCalledWith(casResponse, {
        explicitArray: false,
      })

      expect(prismaMock.user.upsert).toHaveBeenCalledWith({
        where: { casId },
        create: { id: 'test-uuid-1234', casId, authType },
        update: { authType },
      })

      expect(mockCreateOneTimeCode).toHaveBeenCalledWith('test-uuid-1234')
      expect(mockRedirect).toHaveBeenCalledWith(
        `${frontendURL}/auth/callback?otc=otc-12345`,
      )
    })

    it('should return error when the ticket is missing', async () => {
      mockRequest.query = {}

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Missing CAS ticket')
    })

    it('should return error when service URL is not configured', async () => {
      mockRequest.query = { ticket }
      mockGetCASServiceURL.mockReturnValue(null)

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Server URLs not configured')
    })

    it('should return error when frontend URL is not configured', async () => {
      mockRequest.query = { ticket }
      mockGetFrontendURL.mockReturnValue(null)

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockSend).toHaveBeenCalledWith('Server URLs not configured')
    })

    it('should return 401 when CAS authentication fails', async () => {
      mockRequest.query = { ticket }

      const casFailureResponse = `
        <cas:serviceResponse>
          <cas:authenticationFailure code="INVALID_TICKET">
            Ticket not recognized
          </cas:authenticationFailure>
        </cas:serviceResponse>
      `

      mockAxiosGet.mockResolvedValue({ data: casFailureResponse })

      mockParseStringPromise.mockResolvedValue({
        'cas:serviceResponse': {
          'cas:authenticationFailure': {
            _: 'Ticket not recognized',
            $: { code: 'INVALID_TICKET' },
          },
        },
      })

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockSend).toHaveBeenCalledWith('CAS auth failed')
      expect(prismaMock.user.upsert).not.toHaveBeenCalled()
    })

    it('should handle CAS server errors', async () => {
      mockRequest.query = { ticket }

      const error = new Error('CAS server unavailable')
      mockAxiosGet.mockRejectedValue(error)

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Internal error')
    })

    it('should handle XML parsing errors', async () => {
      mockRequest.query = { ticket }
      const error = new Error('XML parse error')

      mockAxiosGet.mockResolvedValue({ data: 'invalid xml' })
      mockParseStringPromise.mockRejectedValue(error)

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Internal error')
    })

    it('should handle database errors during user upset', async () => {
      mockRequest.query = { ticket }

      mockAxiosGet.mockResolvedValue({ data: '<xml />' })
      mockParseStringPromise.mockResolvedValue({
        'cas:serviceResponse': {
          'cas:authenticationSuccess': {
            'cas:user': casId,
            'cas:authtype': authType,
          },
        },
      })

      const error = new Error('Database connection failed')
      prismaMock.user.upsert.mockRejectedValue(error)

      await validateCASTicket(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockSend).toHaveBeenCalledWith('Internal error')
    })
  })
})
