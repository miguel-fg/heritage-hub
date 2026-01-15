import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { seedMultipleTags, cleanupDatabase } from '../../helpers/seedData'
import prisma from '../../../src/services/prisma'
import app from '../../../src/app'
import request from 'supertest'

describe('Tag Routes - Integration Tests', () => {
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

  describe('GET /api/tags', () => {
    it('should return multiple tag names', async () => {
      await seedMultipleTags(3)

      const response = await request(app)
        .get('/api/tags')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.tags).toHaveLength(3)
      expect(response.body.tags[0]).toHaveProperty('name')
      expect(response.body.tags[0]).not.toHaveProperty('id')
    })

    it('should return an empty list when there are no tags', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.tags).toHaveLength(0)
    })
  })
})
