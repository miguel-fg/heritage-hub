import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../../src/app'
import prisma from '../../../src/services/prisma'
import { cleanupDatabase } from '../../helpers/seedData'
import {
  seedUser,
  seedModel,
  seedTag,
  seedMaterial,
  seedMultipleModels,
} from '../../helpers/seedData'

describe('Search Routes - Integration Tests', () => {
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

  describe('GET /api/search', () => {
    it('should return all models with default parameters', async () => {
      const user = await seedUser()
      await seedMultipleModels(user.id, 5)

      const response = await request(app)
        .get('/api/search')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.models).toHaveLength(5)
      expect(response.body.total).toBe(5)
    })

    it('should search by query string in model name', async () => {
      const user = await seedUser()
      await seedModel({ ownerId: user.id, name: 'Ancient Pottery Vase' })
      await seedModel({ ownerId: user.id, name: 'Modern Sculpture' })
      await seedModel({ ownerId: user.id, name: 'Ancient Bronze Statue' })

      const response = await request(app)
        .get('/api/search')
        .query({ q: 'ancient' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(2)
      expect(response.body.models).toHaveLength(2)
      expect(
        response.body.models.every((m: any) =>
          m.name.toLowerCase().includes('ancient'),
        ),
      ).toBe(true)
    })

    it('should search by query string in caption', async () => {
      const user = await seedUser()
      await seedModel({
        ownerId: user.id,
        name: 'Object One',
        caption: 'Beautiful ceramic artifact',
      })
      await seedModel({
        ownerId: user.id,
        name: 'Object Two',
        caption: 'Metal tool from excavation',
      })

      const response = await request(app)
        .get('/api/search')
        .query({ q: 'ceramic' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(1)
      expect(response.body.models).toHaveLength(1)
      expect(response.body.models[0].caption).toContain('ceramic')
    })

    it('should filter by tags', async () => {
      const user = await seedUser()
      const ancientTag = await seedTag('Ancient')
      const ceramicTag = await seedTag('Ceramic')
      const metalTag = await seedTag('Metal')

      await seedModel({
        ownerId: user.id,
        name: 'Model 1',
        tags: [{ id: ancientTag.id }, { id: ceramicTag.id }],
      })

      await seedModel({
        ownerId: user.id,
        name: 'Model 2',
        tags: [{ id: metalTag.id }],
      })

      const response = await request(app)
        .get('/api/search')
        .query({ tags: 'Ancient' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(1)
      expect(response.body.models[0].name).toBe('Model 1')
    })

    it('should filter by materials', async () => {
      const user = await seedUser()
      const clay = await seedMaterial('Clay')
      const bronze = await seedMaterial('Bronze')
      const wood = await seedMaterial('Wood')

      await seedModel({
        ownerId: user.id,
        name: 'Model One',
        materials: [{ id: clay.id }],
      })

      await seedModel({
        ownerId: user.id,
        name: 'Model Two',
        materials: [{ id: bronze.id }],
      })

      await seedModel({
        ownerId: user.id,
        name: 'Model Three',
        materials: [{ id: wood.id }],
      })

      const response = await request(app)
        .get('/api/search')
        .query({ materials: 'Clay,Bronze' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(2)
    })

    it('should filter by downloadable status', async () => {
      const user = await seedUser()
      await seedModel({ ownerId: user.id, downloadable: true })
      await seedModel({ ownerId: user.id, downloadable: true })
      await seedModel({ ownerId: user.id, downloadable: false })

      const response = await request(app)
        .get('/api/search')
        .query({ others: 'downloadable' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(2)
    })

    it('should combine query string with filters', async () => {
      const user = await seedUser()
      const ancientTag = await seedTag('Ancient')
      const ceramicMaterial = await seedMaterial('Ceramic')

      await seedModel({
        ownerId: user.id,
        name: 'Ancient Ceramic Vase',
        tags: [{ id: ancientTag.id }],
        materials: [{ id: ceramicMaterial.id }],
      })

      await seedModel({
        ownerId: user.id,
        name: 'Ancient Bronze Statue',
        tags: [{ id: ancientTag.id }],
      })

      await seedModel({
        ownerId: user.id,
        name: 'Modern Ceramic Bowl',
        materials: [{ id: ceramicMaterial.id }],
      })

      const response = await request(app)
        .get('/api/search')
        .query({ q: 'ancient', tags: 'Ancient', materials: 'Ceramic' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.total).toBe(1)
      expect(response.body.models[0].name).toBe('Ancient Ceramic Vase')
    })

    it('should sort by newest (default)', async () => {
      const user = await seedUser()

      await seedModel({ ownerId: user.id, name: 'First' })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await seedModel({ ownerId: user.id, name: 'Second' })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await seedModel({ ownerId: user.id, name: 'Third' })

      const response = await request(app)
        .get('/api/search')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.models[0].name).toBe('Third')
      expect(response.body.models[2].name).toBe('First')
    })

    it('should sort by oldest when specified', async () => {
      const user = await seedUser()

      await seedModel({ ownerId: user.id, name: 'First' })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await seedModel({ ownerId: user.id, name: 'Second' })
      await new Promise((resolve) => setTimeout(resolve, 10))
      await seedModel({ ownerId: user.id, name: 'Third' })

      const response = await request(app)
        .get('/api/search')
        .query({ sort: 'oldest' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.models[0].name).toBe('First')
      expect(response.body.models[2].name).toBe('Third')
    })

    it('should respect custom pagination parameters', async () => {
      const user = await seedUser()
      await seedMultipleModels(user.id, 5)

      const response = await request(app)
        .get('/api/search')
        .query({ limit: 3 })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.models).toHaveLength(3)
      expect(response.body.total).toBe(5)
    })

    it('should use default pagination parameters when not specified', async () => {
      const user = await seedUser()
      await seedMultipleModels(user.id, 20)

      const response = await request(app)
        .get('/api/search')
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.models).toHaveLength(18)
      expect(response.body.total).toBe(20)
    })

    it('should return empty array when no models match', async () => {
      const user = await seedUser()
      await seedModel({ ownerId: user.id, name: 'Test Model' })

      const response = await request(app)
        .get('/api/search')
        .query({ q: 'nonexistent' })
        .set('Origin', 'http://localhost:5173')

      expect(response.status).toBe(200)
      expect(response.body.models).toEqual([])
      expect(response.body.total).toBe(0)
    })
  })
})
