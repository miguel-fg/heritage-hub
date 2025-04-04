import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client";

export const generatePresignedUrl = async (
  bucketName: string,
  objectKey: string,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
};
