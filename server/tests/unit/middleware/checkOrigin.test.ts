import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextFunction, Request, Response } from 'express'
import { checkOrigin } from '../../../src/middleware/checkOrigin'

describe('CheckOrigin Middleware - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let mockStatus: ReturnType<typeof vi.fn>
  let mockSend: ReturnType<typeof vi.fn>

  const allowedOrigins = [
    'https://example.com',
    'https://app.example.com',
    'http://localhost:3000',
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockSend = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ send: mockSend })
    mockNext = vi.fn()

    mockRequest = {
      method: 'GET',
      headers: {},
    }

    mockResponse = {
      status: mockStatus,
      send: mockSend,
    } as unknown as Response
  })

  describe('GET requests', () => {
    it('should allow GET requests without checking origin', () => {
      mockRequest.method = 'GET'
      mockRequest.headers = {}

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })
  })

  describe('POST requests', () => {
    beforeEach(() => {
      mockRequest.method = 'POST'
    })

    it('should allow requests with valid origin header', () => {
      mockRequest.headers = { origin: 'https://example.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests without origin or referer headers', () => {
      mockRequest.headers = {}

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with invalid origin header', () => {
      mockRequest.headers = { origin: 'https://malicious.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow requests with valid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://example.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests with invalid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://malicious.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with malformed referer header', () => {
      mockRequest.headers = { referer: 'not-a-valid-url' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Invalid Referer header')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should extract origin from referer with path and query', () => {
      mockRequest.headers = {
        referer: 'https://app.example.com/some/path?query=param#hash',
      }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockStatus).not.toHaveBeenCalled()
    })
  })

  describe('PUT requests', () => {
    beforeEach(() => {
      mockRequest.method = 'PUT'
    })

    it('should allow requests with valid origin header', () => {
      mockRequest.headers = { origin: 'https://example.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests without origin or referer headers', () => {
      mockRequest.headers = {}

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with invalid origin header', () => {
      mockRequest.headers = { origin: 'https://malicious.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow requests with valid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://example.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests with invalid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://malicious.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with malformed referer header', () => {
      mockRequest.headers = { referer: 'not-a-valid-url' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Invalid Referer header')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should extract origin from referer with path and query', () => {
      mockRequest.headers = {
        referer: 'https://app.example.com/some/path?query=param#hash',
      }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockStatus).not.toHaveBeenCalled()
    })
  })

  describe('PATCH requests', () => {
    beforeEach(() => {
      mockRequest.method = 'PATCH'
    })

    it('should allow requests with valid origin header', () => {
      mockRequest.headers = { origin: 'https://example.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests without origin or referer headers', () => {
      mockRequest.headers = {}

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with invalid origin header', () => {
      mockRequest.headers = { origin: 'https://malicious.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow requests with valid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://example.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests with invalid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://malicious.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with malformed referer header', () => {
      mockRequest.headers = { referer: 'not-a-valid-url' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Invalid Referer header')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should extract origin from referer with path and query', () => {
      mockRequest.headers = {
        referer: 'https://app.example.com/some/path?query=param#hash',
      }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockStatus).not.toHaveBeenCalled()
    })
  })

  describe('DELETE requests', () => {
    beforeEach(() => {
      mockRequest.method = 'POST'
    })

    it('should allow requests with valid origin header', () => {
      mockRequest.headers = { origin: 'https://example.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests without origin or referer headers', () => {
      mockRequest.headers = {}

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with invalid origin header', () => {
      mockRequest.headers = { origin: 'https://malicious.com' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should allow requests with valid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://example.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
    })

    it('should block requests with invalid referer header when origin is missing', () => {
      mockRequest.headers = { referer: 'https://malicious.com/page' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Origin not allowed')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should block requests with malformed referer header', () => {
      mockRequest.headers = { referer: 'not-a-valid-url' }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockStatus).toHaveBeenCalledWith(403)
      expect(mockSend).toHaveBeenCalledWith('Invalid Referer header')
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should extract origin from referer with path and query', () => {
      mockRequest.headers = {
        referer: 'https://app.example.com/some/path?query=param#hash',
      }

      const middleware = checkOrigin(allowedOrigins)
      middleware(mockRequest as Request, mockResponse as Response, mockNext)

      expect(mockNext).toHaveBeenCalledTimes(1)
      expect(mockStatus).not.toHaveBeenCalled()
    })
  })
})
