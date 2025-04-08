import { S3Client } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!;

const ACCESS_KEY_ID = process.env.HH_FULL_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.HH_FULL_ACCESS_KEY!;

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

export default s3Client;
