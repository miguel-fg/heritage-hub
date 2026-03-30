import { Request, Response } from 'express'
import {
  PutObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import s3Client from '../services/s3Client'
import prisma from '../services/prisma'
import { type ModelPdfRequestBody } from '../scripts/validators'

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!

export const createPdfs = async (
  req: Request<unknown, unknown, ModelPdfRequestBody>,
  res: Response,
): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const { modelId, pdfs } = req.body

  try {
    await prisma.modelPdfs.createMany({
      data: pdfs.map((pdf) => ({ ...pdf, modelId })),
    })

    res.status(201).json({ message: 'PDFs created successfully' })
  } catch (error) {
    console.error('[server] Failed to create PDFs. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to create PDFs. ERR: ${error}`,
    })
  }
}

export const deletePdf = async (req: Request, res: Response): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const { modelId, pdfId } = req.body

  if (!modelId || !pdfId) {
    res.status(400).json({ error: 'modelId and pdfId are required' })
    return
  }

  try {
    const pdf = await prisma.modelPdfs.findUnique({
      where: { id: pdfId },
      select: { id: true, modelId: true },
    })

    if (!pdf) {
      res.status(404).json({ error: 'PDF file not found' })
      return
    }

    if (pdf.modelId !== modelId) {
      res.status(403).json({ error: 'Mismatching model IDs' })
      return
    }

    await Promise.all([
      prisma.modelPdfs.delete({ where: { id: pdf.id } }),
      s3Client.send(
        new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: `${modelId}/pdfs/${pdf.id}.pdf`,
        }),
      ),
    ])

    res.status(200).json({ message: 'PDF file deleted successfully' })
  } catch (error) {
    console.error('[server]: Failed to delete PDF file. ERR: ', error)
    res
      .status(500)
      .json({ error: `[server]: Failed to delete PDF file. ERR: ${error}` })
  }
}

export const processPdf = async (
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
  }

  const { modelId, pdfId } = req.body

  if (!modelId || !pdfId) {
    res.status(400).json({ error: 'modelId and pdfId are required' })
    return
  }

  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `${modelId}/pdfs/${pdfId}.pdf`,
        Body: req.file!.buffer,
        ContentType: 'application/pdf',
      }),
    )

    res.status(200).json({ message: 'PDFs processed' })
  } catch (error) {
    console.error('[server]: Failed to process PDF. ERR: ', error)
    res
      .status(500)
      .json({ error: `[server]: Failed to process PDF. ERR: ${error}` })
  }
}

export const cancelPdfs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const { modelId, pdfIds } = req.body

  if (!modelId || !Array.isArray(pdfIds) || pdfIds.length === 0) {
    res.status(400).json({ error: 'modelId and pdfIds are required' })
    return
  }

  try {
    const objects: { Key: string }[] = pdfIds.map((pdfId: string) => ({
      Key: `${modelId}/pdfs/${pdfId}.pdf`,
    }))

    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET_NAME,
        Delete: { Objects: objects },
      }),
    )

    res.status(200).json({ message: 'PDFs cleaned up successfully' })
  } catch (error) {
    console.error('[server]: Failed to clean up pdfs. ERR: ', error)
    res
      .status(500)
      .json({ error: `[server]: Failed to clean up PDFs. ERR: ${error}` })
  }
}
