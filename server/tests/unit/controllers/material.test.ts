import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { fakeMaterial } from '../../fixtures/fakes'

const prismaMock = vi.hoisted(() => ({
  material: {
    findMany: vi.fn(),
  },
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

import { getMaterials } from '../../../src/controllers/material'

describe('Material Controller - Unit Tests', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockStatus: ReturnType<typeof vi.fn>
  let mockJson: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    mockJson = vi.fn()
    mockStatus = vi.fn().mockReturnValue({ json: mockJson })

    mockRequest = {}
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    } as unknown as Response
  })

  describe('getMaterials', () => {
    it('should return materials from database', async () => {
      const materials = [{ name: fakeMaterial.name }]

      prismaMock.material.findMany.mockResolvedValue(materials)

      await getMaterials(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.material.findMany).toHaveBeenCalledWith({
        select: {
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ materials })
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed')
      prismaMock.material.findMany.mockRejectedValue(error)

      await getMaterials(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining(
          'Failed to fetch materials from database',
        ),
      })
    })
  })
})
