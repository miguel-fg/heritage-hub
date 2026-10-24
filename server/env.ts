import * as z from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const hex32 = z.string().regex(/^[a-f0-9]{32}$/)
const hex64 = z.string().regex(/^[a-f0-9]{64}$/)
const postgresUrl = z.url({ protocol: /^postgres(ql)?$/ })

const envSchema = z.object({
  ENVIRONMENT: z.enum(['dev', 'prod', 'test']),

  PORT: z.coerce.number().int().min(1).max(65535),

  DATABASE_URL: postgresUrl,
  DATABASE_TEST_URL: postgresUrl.optional(),

  CLOUDFLARE_ACCOUNT_ID: hex32,
  CLOUDFLARE_R2_BUCKET_NAME: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/, 'Invalid R2 bucket name'),

  HH_READ_ONLY_KEY_ID: hex32,
  HH_READ_ONLY_ACCESS_KEY: hex64,

  HH_FULL_KEY_ID: hex32,
  HH_FULL_ACCESS_KEY: hex64,

  CAS_DEV: z.httpUrl().endsWith('/api/cas/callback'),
  CAS_PROD: z.httpUrl().endsWith('/api/cas/callback'),

  HH_DEV: z.url({ protocol: /^https?$/ }),
  HH_PROD: z.httpUrl(),
})

type Env = z.infer<typeof envSchema>

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error(z.prettifyError(result.error))
  process.exit(1)
}

export const ENV: Env = result.data
