import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../../../src/app'
import prisma from '../../../src/services/prisma'
import {
  seedUser,
  cleanupDatabase,
  seedMultipleUsers,
  seedOneTimeCode,
  seedExpiredOneTimeCode,
} from '../../helpers/seedData'
import {
  createAuthenticatedAdmin,
  createAuthenticatedFull,
  createAuthenticatedUser,
  getAuthCookie,
} from '../../helpers/authUtils'

describe('User Routes - Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect()
  })

  afterAll(async () => {
    await cleanupDatabase()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    await cleanupDatabase()
  })

  describe('GET /api/user/me', () => {
    it('should return user data from authenticated request', async () => {
      const { user, sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .get('/api/user/me')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.body.user).toEqual(user)
    })
    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/user/me')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(401)
      expect(response.body.user).toBeUndefined()
    })
  })

  describe('PATCH /api/user/me', () => {
    it('should update current user display name', async () => {
      const { sessionToken } = await createAuthenticatedUser()
      const displayName = 'Test Name'

      const response = await request(app)
        .patch('/api/user/me')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ displayName })

      expect(response.status).toBe(200)
      expect(response.body.displayName).toEqual(displayName)
    })

    it('should reject invalid display name data', async () => {
      const { sessionToken } = await createAuthenticatedUser()
      const displayName = undefined

      const response = await request(app)
        .patch('/api/user/me')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ displayName })

      expect(response.status).toBe(400)
      expect(response.text).toContain('Missing user display name')
    })

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .patch('/api/user/me')
        .set('Origin', 'http://localhost:5173')
        .send({ displayName: 'Test Name ' })

      expect(response.status).toBe(401)
    })

    it('should handle database update errors', async () => {
      const { sessionToken } = await createAuthenticatedUser()
      const displayName: any = []

      const response = await request(app)
        .patch('/api/user/me')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ displayName })

      expect(response.status).toBe(500)
      expect(response.text).toContain('Failed to update user')
    })
  })

  describe('GET /api/user/all', () => {
    it('should return all users with model counts', async () => {
      const { sessionToken } = await createAuthenticatedAdmin()
      await seedMultipleUsers(5)

      const response = await request(app)
        .get('/api/user/all')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.users).toHaveLength(6) // seed users + user making request
      expect(response.body.users[0]).toHaveProperty('_count')
    })

    it('should reject non ADMIN user requests', async () => {
      const { sessionToken } = await createAuthenticatedFull()
      await seedMultipleUsers(2)

      const response = await request(app)
        .get('/api/user/all')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(403)
      expect(response.text).toContain('Not authorized to access')
    })

    it('should reject unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/user/all')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(401)
    })
  })

  describe('PATCH /api/user/all', () => {
    it('should update multiple users display names and permissions', async () => {
      const { sessionToken } = await createAuthenticatedAdmin()
      const users = await seedMultipleUsers(3)

      const changedUsers = [
        {
          id: users[0].id,
          displayName: 'Name One',
          permissions: 'FULL',
        },
        {
          id: users[1].id,
          displayName: 'Name Two',
          permissions: 'RESTRICTED',
        },
      ]

      const response = await request(app)
        .patch('/api/user/all')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ changedUsers })

      expect(response.status).toBe(200)
      expect(response.body.updated).toHaveLength(2)
      expect(response.body.updated[0].displayName).toEqual('Name One')
      expect(response.body.updated[0].permissions).toEqual('FULL')
      expect(response.body.updated[1].displayName).toEqual('Name Two')
      expect(response.body.updated[1].permissions).toEqual('RESTRICTED')
    })

    it('should reject non ADMIN user requests', async () => {
      const { sessionToken } = await createAuthenticatedFull()
      const users = await seedMultipleUsers(2)

      const changedUsers = [
        {
          id: users[0].id,
          displayName: 'Test Name',
          permissions: 'ADMIN',
        },
      ]

      const response = await request(app)
        .patch('/api/user/all')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ changedUsers })

      expect(response.status).toBe(403)
      expect(response.text).toContain('Not authorized to access')
    })

    it('should reject invalid updated data', async () => {
      const { sessionToken } = await createAuthenticatedAdmin()
      const changedUsers = 'display Name'

      const response = await request(app)
        .patch('/api/user/all')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ changedUsers })

      expect(response.status).toBe(400)
      expect(response.text).toContain('invalid updated users')
    })

    it('should reject unauthenticated requests', async () => {
      const response = await request(app)
        .patch('/api/user/all')
        .set('Origin', 'http://localhost:5173')
        .send({ changedUsers: [] })

      expect(response.status).toBe(401)
    })

    it('should handle database update errors', async () => {
      const { sessionToken } = await createAuthenticatedAdmin()

      const response = await request(app)
        .patch('/api/user/all')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')
        .send({ changedUsers: ['Name one', 'Name two'] })

      expect(response.status).toBe(500)
      expect(response.text).toContain('Failed to update users')
    })
  })

  describe('POST /api/user/otc', () => {
    it('should exchange valid OTC for session cookie', async () => {
      const user = await seedUser()
      const otc = await seedOneTimeCode({ userId: user.id })

      const response = await request(app)
        .post('/api/user/otc')
        .set('Origin', 'http://localhost:5173')
        .send({ otc: otc.code })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies[0]).toContain('session=')
      expect(cookies[0]).toContain('HttpOnly')
      expect(cookies[0]).toContain('SameSite=Lax')
      expect(cookies[0]).toContain('Expires=')

      const deletedOtc = await prisma.oneTimeCode.findUnique({
        where: { code: otc.code },
      })

      expect(deletedOtc).toBeNull()

      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      })

      expect(sessions).toHaveLength(1)
    })

    it('should reject invalid OTC', async () => {
      const response = await request(app)
        .post('/api/user/otc')
        .set('Origin', 'http://localhost:5173')
        .send({ otc: 'invalid-otc-code' })

      expect(response.status).toBe(500)
      expect(response.text).toContain('Failed to exchange OTC')
    })

    it('should reject expired OTC', async () => {
      const user = await seedUser()
      const expiredOtc = await seedExpiredOneTimeCode({ userId: user.id })

      const response = await request(app)
        .post('/api/user/otc')
        .set('Origin', 'http://localhost:5173')
        .send({ otc: expiredOtc.code })

      expect(response.status).toBe(500)
      expect(response.text).toContain('Failed to exchange OTC')

      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      })

      expect(sessions).toHaveLength(0)
    })

    it('should only allow OTC to be used once', async () => {
      const user = await seedUser()
      const otc = await seedOneTimeCode({ userId: user.id })

      const firstResponse = await request(app)
        .post('/api/user/otc')
        .set('Origin', 'http://localhost:5173')
        .send({ otc: otc.code })

      expect(firstResponse.status).toBe(200)

      const secondResponse = await request(app)
        .post('/api/user/otc')
        .set('Origin', 'http://localhost:5173')
        .send({ otc: otc.code })

      expect(secondResponse.status).toBe(500)
    })
  })

  describe('POST /api/user/logout', () => {
    it('should logout user and delete session', async () => {
      const { user, sessionToken } = await createAuthenticatedUser()

      const response = await request(app)
        .post('/api/user/logout')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Logout successful')

      const cookies = response.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(cookies[0]).toContain('session=')
      expect(cookies[0]).toContain('Max-Age=0')

      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
      })

      expect(sessions).toHaveLength(0)
    })

    it('should reject requests with invalid session tokens', async () => {
      const response = await request(app)
        .post('/api/user/logout')
        .set('Cookie', getAuthCookie('invalid-session-token'))
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(500)
    })

    it('should reject requests with missing session tokens', async () => {
      const response = await request(app)
        .post('/api/user/logout')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(401)
      expect(response.body.message).toBe('No session token')
      expect(response.body.user).toBeNull()
    })

    it('should allow multiple logout requests without error', async () => {
      const { sessionToken } = await createAuthenticatedUser()

      const firstResponse = await request(app)
        .post('/api/user/logout')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(firstResponse.status).toBe(200)

      const secondResponse = await request(app)
        .post('/api/user/logout')
        .set('Cookie', getAuthCookie(sessionToken))
        .set('Origin', 'http://localhost:5173')

      expect(secondResponse.status).toBe(500)
    })
  })
})
