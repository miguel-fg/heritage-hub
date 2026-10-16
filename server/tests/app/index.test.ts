import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { listen } = vi.hoisted(() => ({ listen: vi.fn() }))

vi.mock('../../src/app', () => ({ default: { listen } }))

async function loadIndex() {
  vi.resetModules()
  await import('../../src/index')
}

beforeEach(() => {
  listen.mockClear()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('Server entrypoint', () => {
  it('listens on port 3000 by default', async () => {
    vi.stubEnv('PORT', '')
    await loadIndex()
    expect(listen).toHaveBeenCalledWith(3000, expect.any(Function))
  })

  it('uses the port from the environment', async () => {
    vi.stubEnv('PORT', '4000')
    await loadIndex()
    expect(listen).toHaveBeenCalledWith('4000', expect.any(Function))
  })
})
