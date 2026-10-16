import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { PrismaClient } = vi.hoisted(() => ({ PrismaClient: vi.fn() }))

vi.mock('@prisma/client', () => ({ PrismaClient }))

async function loadPrisma(env?: string) {
  vi.resetModules()

  vi.stubEnv('ENVIRONMENT', env)
  vi.stubEnv('DATABASE_URL', 'main-db-url')
  vi.stubEnv('DATABASE_TEST_URL', 'test-db-url')

  return (await import('../../src/services/prisma')).default
}

beforeEach(() => {
  PrismaClient.mockClear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('prisma client', () => {
  it.each([
    ['DATABASE_URL', 'dev', 'main-db-url'],
    ['DATABASE_URL', 'prod', 'main-db-url'],
    ['DATABASE_URL', undefined, 'main-db-url'],
    ['DATABASE_TEST_URL', 'test', 'test-db-url'],
  ] as const)('uses %s when ENVIRONMENT is %s', async (_name, env, url) => {
    await loadPrisma(env)

    expect(PrismaClient).toHaveBeenCalledTimes(1)
    expect(PrismaClient).toHaveBeenCalledWith({
      datasources: { db: { url } },
    })
  })

  it('exports the PrismaClient instance', async () => {
    const prisma = await loadPrisma('dev')

    expect(prisma).toBeInstanceOf(PrismaClient)
  })
})
