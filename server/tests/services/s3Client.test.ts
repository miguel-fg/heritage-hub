import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { S3Client } = vi.hoisted(() => ({ S3Client: vi.fn() }))

vi.mock('@aws-sdk/client-s3', () => ({ S3Client }))

async function loadClient() {
  vi.resetModules()

  vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'acc-123')
  vi.stubEnv('HH_FULL_KEY_ID', 'key-id')
  vi.stubEnv('HH_FULL_ACCESS_KEY', 'secret-key')

  return (await import('../../src/services/s3Client')).default
}

beforeEach(() => {
  S3Client.mockClear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('S3 client', () => {
  it('configures the R2 endpoint from the environment variables', async () => {
    await loadClient()

    expect(S3Client).toHaveBeenCalledTimes(1)
    expect(S3Client).toHaveBeenCalledWith({
      region: 'auto',
      endpoint: 'https://acc-123.r2.cloudflarestorage.com',
      credentials: {
        accessKeyId: 'key-id',
        secretAccessKey: 'secret-key',
      },
    })
  })

  it('exports the S3Client instance', async () => {
    const s3Client = await loadClient()

    expect(s3Client).toBeInstanceOf(S3Client)
  })
})
