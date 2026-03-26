import { Request, Response } from 'express'
import prisma from '../services/prisma'
import { ModelImageRequestBody } from '../scripts/validators'
import sharp from 'sharp'
import s3Client from '../services/s3Client'
import { PutObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!

export const createImages = async (
  req: Request<unknown, unknown, ModelImageRequestBody>,
  res: Response,
): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const { modelId, images } = req.body

  try {
    await prisma.modelImage.createMany({
      data: images.map((img) => ({ ...img, modelId })),
    })

    res.status(201).json({ message: 'Images created successfully' })
  } catch (error) {
    console.error('[server] Failed to create images. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to create images. ERR: ${error}`,
    })
  }
}

export const processImage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  if (!req.file) {
    res.status(400).json({ error: 'No file provided' })
    return
  }

  const { modelId, imageId } = req.body

  if (!modelId || !imageId) {
    res.status(400).json({ error: 'modelId and imageId are required' })
    return
  }

  try {
    const [thumbBuffer, fullBuffer] = await Promise.all([
      sharp(req.file.buffer)
        .resize({ width: 400 })
        .webp({ quality: 60 })
        .toBuffer(),
      sharp(req.file.buffer)
        .resize({ width: 2048, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer(),
    ])

    await Promise.all([
      s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `${modelId}/images/${imageId}/thumb.webp`,
          Body: thumbBuffer,
          ContentType: 'image/webp',
        }),
      ),
      s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `${modelId}/images/${imageId}/full.webp`,
          Body: fullBuffer,
          ContentType: 'image/webp',
        }),
      ),
    ])

    res.status(200).json({ message: 'Images processed' })
  } catch (error) {
    console.error('[server] Failed to process image. ERR: ', error)
    res
      .status(500)
      .json({ error: `[server]: Failed to process image. ERR: ${error}` })
  }
}

export const cancelImages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = req.user
  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const { modelId, imageIds } = req.body

  if (!modelId || !Array.isArray(imageIds) || imageIds.length === 0) {
    res.status(400).json({ error: 'modelId and imageIds are required' })
    return
  }

  try {
    const objects: { Key: string }[] = imageIds.flatMap((imageId: string) => [
      { Key: `${modelId}/images/${imageId}/thumb.webp` },
      { Key: `${modelId}/images/${imageId}/full.webp` },
    ])

    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: { Objects: objects },
      }),
    )

    res.status(200).json({ message: 'Images cleaned up successfully' })
  } catch (error) {
    console.error('[server] Failed to clean up images. ERR: ', error)
    res
      .status(500)
      .json({ error: `[server]: Failed to clean up images. ERR: ${error}` })
  }
}
