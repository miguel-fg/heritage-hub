import { vi } from 'vitest'

vi.mock('../env', () => ({
  ENV: {
    ENVIRONMENT: 'test',
    PORT: 3000,
    DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
    DATABASE_TEST_URL: 'postgresql://user:pass@localhost:5432/db_test',
    CLOUDFLARE_ACCOUNT_ID: 'a'.repeat(32),
    CLOUDFLARE_R2_BUCKET_NAME: 'test-bucket',
    HH_READ_ONLY_KEY_ID: 'a'.repeat(32),
    HH_READ_ONLY_ACCESS_KEY: 'a'.repeat(64),
    HH_FULL_KEY_ID: 'a'.repeat(32),
    HH_FULL_ACCESS_KEY: 'a'.repeat(64),
    CAS_DEV: 'http://localhost:3000/api/cas/callback',
    CAS_PROD: 'http://localhost:3000/api/cas/callback',
    HH_DEV: 'http://localhost:3000',
    HH_PROD: 'http://localhost:3000',
  },
}))
