import { ENV } from '../../env'
import { S3Client } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ENV.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ENV.HH_FULL_KEY_ID,
    secretAccessKey: ENV.HH_FULL_ACCESS_KEY,
  },
})

export default s3Client
