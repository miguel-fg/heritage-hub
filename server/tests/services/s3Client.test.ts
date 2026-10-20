import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ENV } from '../../env'

const { S3Client } = vi.hoisted(() => ({ S3Client: vi.fn() }))

vi.mock('@aws-sdk/client-s3', () => ({ S3Client }))

const defaultEnv = { ...ENV }

async function loadClient() {
  vi.resetModules()

  return (await import('../../src/services/s3Client')).default
}

beforeEach(() => {
  S3Client.mockClear()
})

afterEach(() => {
  Object.assign(ENV, defaultEnv)
})

describe('S3 client', () => {
  it('configures the R2 endpoint from the environment variables', async () => {
    await loadClient()

    expect(S3Client).toHaveBeenCalledTimes(1)
    expect(S3Client).toHaveBeenCalledWith({
      region: 'auto',
      endpoint: `https://${ENV.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ENV.HH_FULL_KEY_ID,
        secretAccessKey: ENV.HH_FULL_ACCESS_KEY,
      },
    })
  })

  it('exports the S3Client instance', async () => {
    const s3Client = await loadClient()

    expect(s3Client).toBeInstanceOf(S3Client)
  })
})
