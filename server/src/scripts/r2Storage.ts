import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client";

export const generatePresignedUrl = async (
  bucketName: string,
  objectKey: string,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const generatePresignedUploadUrl = async (
  bucketName: string,
  objectKey: string,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

export const deleteObjectFromR2 = async (
  bucketName: string,
  objectKey: string,
) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });

  try {
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(
      `[R2 Error] Error deleting object ${objectKey}: ERR: `,
      error,
    );
    throw error;
  }
};
