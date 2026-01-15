import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { seedMultipleMaterials, cleanupDatabase } from '../../helpers/seedData'
import prisma from '../../../src/services/prisma'
import app from '../../../src/app'
import request from 'supertest'

describe('Material Routes - Integration Tests', () => {
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

  describe('GET /api/materials', () => {
    it('should return multiple material names', async () => {
      await seedMultipleMaterials(3)

      const response = await request(app)
        .get('/api/materials')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.materials).toHaveLength(3)
      expect(response.body.materials[0]).toHaveProperty('name')
      expect(response.body.materials[0]).not.toHaveProperty('id')
    })

    it('should return an empty list when there are no materials', async () => {
      const response = await request(app)
        .get('/api/materials')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.materials).toHaveLength(0)
    })
  })
})
