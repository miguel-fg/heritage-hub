import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { fakeModel, fakeTag, fakeMaterial } from '../../fixtures/fakes'

const mockBuildModelSearchConditions = vi.hoisted(() => vi.fn())
const mockBuildModelSortConditions = vi.hoisted(() => vi.fn())

vi.mock('../../../src/scripts/prisma', () => ({
  buildModelSearchConditions: mockBuildModelSearchConditions,
  buildModelSortConditions: mockBuildModelSortConditions,
  withPrismaRetry: vi.fn((fn) => fn()),
}))

const prismaMock = vi.hoisted(() => ({
  model: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

import { searchModels } from '../../../src/controllers/search'

describe('Search Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockJson = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ json: mockJson })

    mockRequest = { query: {} }
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response

    mockBuildModelSearchConditions.mockReturnValue({})
    mockBuildModelSortConditions.mockReturnValue({ createdAt: 'desc' })
  })

  describe('searchModels', () => {
    it('should search with default parameters', async () => {
      const models = [
        {
          ...fakeModel,
          tags: [fakeTag],
          materials: fakeMaterial,
        },
      ]

      prismaMock.model.count.mockResolvedValue(1)
      prismaMock.model.findMany.mockResolvedValue(models)

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: '',
        tags: [],
        materials: [],
        others: [],
      })
      expect(mockBuildModelSortConditions).toHaveBeenCalledWith('newest')
      expect(prismaMock.model.count).toHaveBeenCalledTimes(1)
      expect(prismaMock.model.findMany).toHaveBeenCalledWith({
        where: {},
        select: expect.objectContaining({
          id: true,
          name: true,
          caption: true,
        }),
        orderBy: { createdAt: 'desc' },
        take: 18,
        skip: 0,
      })
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ models, total: 1 })
    })

    it('should search with query string', async () => {
      mockRequest.query = { q: 'ancient vase' }

      prismaMock.model.count.mockResolvedValue(5)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: 'ancient vase',
        tags: [],
        materials: [],
        others: [],
      })
    })

    it('should search with tags filter', async () => {
      mockRequest.query = { tags: 'ancient,ceramic,historical' }

      prismaMock.model.count.mockResolvedValue(3)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: '',
        tags: ['ancient', 'ceramic', 'historical'],
        materials: [],
        others: [],
      })
    })

    it('should search with materials filter', async () => {
      mockRequest.query = { materials: 'clay,bronze' }

      prismaMock.model.count.mockResolvedValue(2)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: '',
        tags: [],
        materials: ['clay', 'bronze'],
        others: [],
      })
    })

    it('should search with others filter', async () => {
      mockRequest.query = { others: 'downloadable' }

      prismaMock.model.count.mockResolvedValue(1)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: '',
        tags: [],
        materials: [],
        others: ['downloadable'],
      })
    })

    it('should search with custom sort', async () => {
      mockRequest.query = { sort: 'oldest' }
      mockBuildModelSortConditions.mockReturnValue({ createdAt: 'asc' })

      prismaMock.model.count.mockResolvedValue(1)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSortConditions).toHaveBeenCalledWith('oldest')
      expect(prismaMock.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        }),
      )
    })

    it('should search with pagination parameters', async () => {
      mockRequest.query = { limit: '10', skip: '20' }
      prismaMock.model.count.mockResolvedValue(50)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 20,
        }),
      )
    })

    it('should search with combined filters', async () => {
      mockRequest.query = {
        q: 'pottery',
        tags: 'ancient,ceramic',
        materials: 'clay',
        sort: 'alphabetical',
        limit: '25',
        skip: '10',
        others: 'downloadable',
      }

      prismaMock.model.count.mockResolvedValue(8)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: 'pottery',
        tags: ['ancient', 'ceramic'],
        materials: ['clay'],
        others: ['downloadable'],
      })
      expect(mockBuildModelSortConditions).toHaveBeenCalledWith('alphabetical')
      expect(prismaMock.model.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 25,
          skip: 10,
        }),
      )
    })

    it('should filter out empty tags and materials', async () => {
      mockRequest.query = {
        tags: 'ancient,,ceramic,',
        materials: ',clay,,stone',
      }

      prismaMock.model.count.mockResolvedValue(2)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: '',
        tags: ['ancient', 'ceramic'],
        materials: ['clay', 'stone'],
        others: [],
      })
    })

    it('should trim whitespace from query', async () => {
      mockRequest.query = { q: '    pottery vase   ' }
      prismaMock.model.count.mockResolvedValue(1)
      prismaMock.model.findMany.mockResolvedValue([])

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockBuildModelSearchConditions).toHaveBeenCalledWith({
        query: 'pottery vase',
        tags: [],
        materials: [],
        others: [],
      })
    })

    it('should handle database errors', async () => {
      const error = new Error('Database search failed')
      prismaMock.model.count.mockRejectedValue(error)

      await searchModels(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to search models'),
      })
    })
  })
})
