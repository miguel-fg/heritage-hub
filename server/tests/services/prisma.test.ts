import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ENV } from '../../env'

const { PrismaClient } = vi.hoisted(() => ({ PrismaClient: vi.fn() }))

vi.mock('@prisma/client', () => ({ PrismaClient }))

const defaultEnv = { ...ENV }

async function loadPrisma(env: (typeof ENV)['ENVIRONMENT'] = 'dev') {
  vi.resetModules()

  ENV.ENVIRONMENT = env
  vi.stubEnv('DATABASE_URL', 'main-db-url')
  vi.stubEnv('DATABASE_TEST_URL', 'test-db-url')

  return (await import('../../src/services/prisma')).default
}

beforeEach(() => {
  PrismaClient.mockClear()
})

afterEach(() => {
  Object.assign(ENV, defaultEnv)
})

describe('prisma client', () => {
  it.each([
    ['DATABASE_URL', 'dev', ENV.DATABASE_URL],
    ['DATABASE_URL', 'prod', ENV.DATABASE_URL],
    ['DATABASE_TEST_URL', 'test', ENV.DATABASE_TEST_URL],
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
