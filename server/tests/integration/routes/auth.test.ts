import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest'
import app from '../../../src/app'
import request from 'supertest'
import prisma from '../../../src/services/prisma'
import { cleanupDatabase } from '../../helpers/seedData'

const mockAxiosGet = vi.hoisted(() => vi.fn())
vi.mock('axios', () => ({
  default: {
    get: mockAxiosGet,
  },
}))

vi.mock('uuid', () => ({
  v4: vi.fn(() => '00000000-0000-0000-0000-000000000000'),
}))

describe('CAS Auth Routes - Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await cleanupDatabase()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await cleanupDatabase()
    vi.clearAllMocks()
  })

  describe('GET /api/cas/login', () => {
    it('should redirect to CAS login with service URL', async () => {
      const response = await request(app)
        .get('/api/cas/login')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(302)
      expect(response.headers.location).toBeDefined()
      expect(response.headers.location).toContain(
        'https://cas.sfu.ca/cas/login',
      )
      expect(response.headers.location).toContain('service=')
      expect(response.headers.location).toContain(
        encodeURIComponent(
          'https://light-true-reindeer.ngrok-free.app/api/cas/callback',
        ),
      )
    })

    it('should return error when CAS service URL is not configured', async () => {
      const originalCAS = process.env.CAS_DEV
      const originalEnv = process.env.ENVIRONMENT

      delete process.env.CAS_DEV
      delete process.env.ENVIRONMENT

      const response = await request(app)
        .get('/api/cas/login')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(500)
      expect(response.body.error).toContain('CAS service URLs not configured')

      process.env.CAS_DEV = originalCAS
      process.env.ENVIRONMENT = originalEnv
    })
  })

  describe('GET /api/cas/callback', () => {
    const validCASResponse = `
      <cas:serviceResponse>
        <cas:authenticationSuccess>
          <cas:user>testUser123</cas:user>
          <cas:authtype>sfu</cas:authtype>
        </cas:authenticationSuccess>
      </cas:serviceResponse>
    `

    it('should create new user and redirect with OTC on successful CAS validation', async () => {
      mockAxiosGet.mockResolvedValue({ data: validCASResponse })

      const response = await request(app)
        .get('/api/cas/callback')
        .query({ ticket: 'ST-12345-valid-ticket' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(302)
      expect(response.headers.location).toBeDefined()
      expect(response.headers.location).toContain(
        'http://localhost:5173/auth/callback',
      )
      expect(response.headers.location).toContain('otc=')

      const user = await prisma.user.findUnique({
        where: { casId: 'testUser123' },
      })

      expect(user).toBeDefined()
      expect(user!.authType).toBe('sfu')
      expect(user!.id).toBe('00000000-0000-0000-0000-000000000000')

      const otcs = await prisma.oneTimeCode.findMany({
        where: { userId: user!.id },
      })

      expect(otcs).toHaveLength(1)
      expect(otcs[0].expiresAt.getTime()).toBeGreaterThan(Date.now())
    })

    it('should reject invalid CAS tickets', async () => {
      const failureCASResponse = `
        <cas:serviceResponse>
          <cas:authenticationFailure code="INVALID_TICKET">
            Ticket not recognized
          </cas:authenticationFailure>
        </cas:serviceResponse>
      `

      mockAxiosGet.mockResolvedValue({ data: failureCASResponse })

      const response = await request(app)
        .get('/api/cas/callback')
        .query({ ticket: 'ST-invalid-ticket' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(401)
      expect(response.text).toContain('CAS auth failed')

      const users = await prisma.user.findMany()
      const otcs = await prisma.oneTimeCode.findMany()
      expect(users).toHaveLength(0)
      expect(otcs).toHaveLength(0)
    })

    it('should reject requests without CAS ticket', async () => {
      const response = await request(app)
        .get('/api/cas/callback')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(400)
      expect(response.text).toContain('Missing CAS ticket')

      const users = await prisma.user.findMany()
      const otcs = await prisma.oneTimeCode.findMany()

      expect(users).toHaveLength(0)
      expect(otcs).toHaveLength(0)
    })

    it('should reject requests when service URL is not configured', async () => {
      const originalCAS = process.env.CAS_DEV
      delete process.env.CAS_DEV

      const response = await request(app)
        .get('/api/cas/callback')
        .query({ ticket: 'ST-12345-valid-ticket' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(400)
      expect(response.text).toContain('Server URLs not configured')

      process.env.CAS_DEV = originalCAS
    })

    it('should reject requests when frontend URL is not configured', async () => {
      const originalHH = process.env.HH_DEV
      delete process.env.HH_DEV

      const response = await request(app)
        .get('/api/cas/callback')
        .query({ ticket: 'ST-12345-valid-ticket' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(400)
      expect(response.text).toContain('Server URLs not configured')

      process.env.HH_DEV = originalHH
    })

    it('should handle CAS server errors', async () => {
      mockAxiosGet.mockRejectedValue(new Error('CAS server unavailable'))

      const response = await request(app)
        .get('/api/cas/callback')
        .query({ ticket: 'ST-12345-valid-ticket' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(500)
      expect(response.text).toContain('Internal error')
    })

    it('should handle XML parsing errors', async () => {
      mockAxiosGet.mockResolvedValue({ data: 'invalid xml content' })

      const response = await request(app)
        .get('/api/cas/callback')
        .query({ ticket: 'ST-12345-valid-ticket' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(500)
      expect(response.text).toContain('Internal error')
    })
  })
})
