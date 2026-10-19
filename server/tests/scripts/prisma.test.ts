import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import {
  buildModelSearchConditions,
  buildModelSortConditions,
  checkModelOwnership,
  ModelNotFoundError,
  withPrismaRetry,
} from '../../src/scripts/prisma'
import prisma from '../../src/services/prisma'

vi.mock('../../src/services/prisma', () => ({
  default: { model: { findUnique: vi.fn() } },
}))

describe('Prisma utility functions', () => {
  describe('buildModelSearchConditions', () => {
    it('returns {} for empty params', () => {
      expect(buildModelSearchConditions({})).toEqual({})
    })

    it('ignores empty query and empty arrays', () => {
      expect(
        buildModelSearchConditions({
          query: '',
          tags: [],
          materials: [],
          others: [],
        }),
      ).toEqual({})
    })

    it('builds case-insensitive OR on name/caption', () => {
      expect(buildModelSearchConditions({ query: 'vase' })).toEqual({
        AND: [
          {
            OR: [
              { name: { contains: 'vase', mode: 'insensitive' } },
              { caption: { contains: 'vase', mode: 'insensitive' } },
            ],
          },
        ],
      })
    })

    it('combines query, tags, and materials under AND in order', () => {
      const where = buildModelSearchConditions({
        query: 'x',
        tags: ['a'],
        materials: ['b'],
      })
      expect(where.AND).toHaveLength(3)
    })

    it('spreads `others` as top-level booleans', () => {
      expect(
        buildModelSearchConditions({ others: ['isPublic', 'isFeatured'] }),
      ).toEqual({
        isPublic: true,
        isFeatured: true,
      })
    })

    it('merges AND and others together', () => {
      const where = buildModelSearchConditions({
        tags: ['a'],
        others: ['isPublic'],
      })

      expect(where).toEqual({
        AND: [{ tags: { some: { name: { in: ['a'] } } } }],
        isPublic: true,
      })
    })

    it('handles duplicate `others` entries', () => {
      expect(
        buildModelSearchConditions({ others: ['isPublic', 'isPublic'] }),
      ).toEqual({
        isPublic: true,
      })
    })

    it('rejects `other` keys not in allowlist', () => {
      expect(
        buildModelSearchConditions({
          others: ['downloadable', 'bronze', 'isPublic', 'roman'],
        }),
      ).toEqual({
        downloadable: true,
        isPublic: true,
      })
    })
  })

  describe('buildModelSortConditions', () => {
    it.each([
      ['oldest', { createdAt: 'asc' }],
      ['a-z', { name: 'asc' }],
      ['z-a', { name: 'desc' }],
      ['newest', { createdAt: 'desc' }],
      ['garbage', { createdAt: 'desc' }],
      ['', { createdAt: 'desc' }],
    ])('%s -> %j', (input, expected) => {
      expect(buildModelSortConditions(input)).toEqual(expected)
    })
  })

  describe('withPrismaRetry', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns on first success without retrying', async () => {
      const fn = vi.fn().mockResolvedValue('ok')

      await expect(withPrismaRetry(fn)).resolves.toBe('ok')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('returns immediately when called with negative or zero retries', async () => {
      const fn = vi.fn().mockResolvedValue('ok')

      await expect(withPrismaRetry(fn, -3)).resolves.toBe('ok')
      await expect(withPrismaRetry(fn, 0)).resolves.toBe('ok')

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('retries on P2034 then succeeds', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce({ code: 'P2034' })
        .mockResolvedValue('ok')

      const p = withPrismaRetry(fn)
      await vi.advanceTimersByTimeAsync(200)

      await expect(p).resolves.toBe('ok')
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('throws immediately on non-retryable code', async () => {
      const err = { code: 'P2002' }
      const fn = vi.fn().mockRejectedValue(err)

      await expect(withPrismaRetry(fn)).rejects.toBe(err)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('throws immediately on negative or zero retries', async () => {
      const err = { message: 'Something went wrong' }
      const fn = vi.fn().mockRejectedValue(err)

      await expect(withPrismaRetry(fn, -3)).rejects.toBe(err)
      await expect(withPrismaRetry(fn, 0)).rejects.toBe(err)

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('throws the last error after exhausting retries', async () => {
      const err = { code: 'P2028' }
      const fn = vi.fn().mockRejectedValue(err)
      const p = withPrismaRetry(fn, 3, 100)
      const assertion = expect(p).rejects.toBe(err)
      await vi.advanceTimersByTimeAsync(200)
      await assertion
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('waits delayMs between attempts', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce({ code: 'P2028' })
        .mockResolvedValue('ok')
      const p = withPrismaRetry(fn, 3, 500)

      await vi.advanceTimersByTimeAsync(499)
      expect(fn).toHaveBeenCalledTimes(1)

      await vi.advanceTimersByTimeAsync(1)
      await expect(p).resolves.toBe('ok')
    })

    it('throws plain errors without a code', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('Something went wrong'))

      await expect(withPrismaRetry(fn)).rejects.toThrow('Something went wrong')
    })
  })

  describe('checkModelOwnership', () => {
    const findUnique = prisma.model.findUnique as unknown as ReturnType<
      typeof vi.fn
    >

    it('returns true when owner matches', async () => {
      findUnique.mockResolvedValue({ ownerId: 'u1' })

      await expect(checkModelOwnership('m1', 'u1')).resolves.toBe(true)
      expect(findUnique).toHaveBeenCalledWith({
        where: { id: 'm1' },
        select: { ownerId: true },
      })
    })

    it('returns false when owner differs', async () => {
      findUnique.mockResolvedValue({ ownerId: 'u2' })

      await expect(checkModelOwnership('m1', 'u1')).resolves.toBe(false)
    })

    it('throws ModelNotFoundError when model is missing', async () => {
      findUnique.mockResolvedValue(null)

      await expect(checkModelOwnership('m1', 'u1')).rejects.toBeInstanceOf(
        ModelNotFoundError,
      )
    })

    it('propagates DB errors', async () => {
      findUnique.mockRejectedValue(new Error('Database Error'))

      await expect(checkModelOwnership('m1', 'u1')).rejects.toThrow(
        'Database Error',
      )
    })
  })
})
