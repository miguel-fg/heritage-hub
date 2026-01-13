import { vi, describe, it, expect, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { fakeTag } from '../../fixtures/fakes'

const prismaMock = vi.hoisted(() => ({
  tag: {
    findMany: vi.fn(),
  },
}))

vi.mock('../../../src/services/prisma', () => ({
  default: prismaMock,
}))

import { getTags } from '../../../src/controllers/tag'

describe('Tag Controller - Unit Tests', () => {
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

  describe('getTags', () => {
    it('should return tags from database', async () => {
      const tags = [{ name: fakeTag.name }]

      prismaMock.tag.findMany.mockResolvedValue(tags)

      await getTags(mockRequest as Request, mockResponse as Response)

      expect(prismaMock.tag.findMany).toHaveBeenCalledWith({
        select: {
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      })
      expect(mockStatus).toHaveBeenCalledWith(200)
      expect(mockJson).toHaveBeenCalledWith({ tags })
    })

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed')
      prismaMock.tag.findMany.mockRejectedValue(error)

      await getTags(mockRequest as Request, mockResponse as Response)

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Failed to fetch tags from database'),
      })
    })
  })
})
