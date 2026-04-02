import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'
import s3Client from '../services/s3Client'

export const generatePresignedUrl = async (
  bucketName: string,
  objectKey: string,
  expiresIn: number = 3600,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export const generateFilePresignedUrl = async (
  bucketName: string,
  objectKey: string,
  filename: string,
  expiresIn: number = 3600,
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  })

  return await getSignedUrl(s3Client, command, { expiresIn })
}

export const generatePresignedUploadUrl = async (
  bucketName: string,
  objectKey: string,
): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  })

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export const deleteObjectFromR2 = async (
  bucketName: string,
  objectKey: string,
) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  })

  try {
    await s3Client.send(command)
    return true
  } catch (error) {
    console.error(`[R2 Error] Error deleting object ${objectKey}: ERR: `, error)
    throw error
  }
}

export const deleteAllFromR2 = async (bucketName: string, prefix: string) => {
  const listed = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    }),
  )

  if (!listed.Contents?.length) return

  const objects = listed.Contents.filter((obj) => obj.Key).map((obj) => ({
    Key: obj.Key!,
  }))

  await s3Client.send(
    new DeleteObjectsCommand({
      Bucket: bucketName,
      Delete: {
        Objects: objects,
        Quiet: true,
      },
    }),
  )
}
