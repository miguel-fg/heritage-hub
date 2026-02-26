import { Request, Response } from 'express'
import prisma from '../services/prisma'
import { ModelImageRequestBody } from '../scripts/validators'

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
