import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ENV } from '../../env'

const { listen } = vi.hoisted(() => ({ listen: vi.fn() }))

vi.mock('../../src/app', () => ({ default: { listen } }))

async function loadIndex() {
  vi.resetModules()
  await import('../../src/index')
}

const defaultEnv = { ...ENV }

beforeEach(() => {
  listen.mockClear()
})

afterEach(() => {
  Object.assign(ENV, defaultEnv)
  vi.restoreAllMocks()
})

describe('Server entrypoint', () => {
  it('listens on port 3000 by default', async () => {
    await loadIndex()
    expect(listen).toHaveBeenCalledWith(3000, expect.any(Function))
  })

  it('uses the port from the environment', async () => {
    ENV.PORT = 4000
    await loadIndex()
    expect(listen).toHaveBeenCalledWith(4000, expect.any(Function))
  })
})
