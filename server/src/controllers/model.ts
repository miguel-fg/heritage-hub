import { Request, Response } from 'express'
import prisma from '../services/prisma'
import {
  generatePresignedUrl,
  generateFilePresignedUrl,
  generatePresignedUploadUrl,
  deleteAllFromR2,
} from '../scripts/r2Storage'
import { ModelRequestBody } from '../scripts/validators'
import { withPrismaRetry } from '../scripts/prisma'

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!

export const getModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 18
    const skip = Number(req.query.skip) || 0

    const total = await prisma.model.count()

    const models = await prisma.model.findMany({
      select: {
        id: true,
        name: true,
        caption: true,
        tags: {
          select: {
            name: true,
          },
        },
        materials: {
          select: {
            name: true,
          },
        },
        downloadable: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: skip,
    })
    res.status(200).json({ models, total })
  } catch (error) {
    console.error(
      '[server]: Failed to fetch models from database. ERR: ',
      error,
    )
    res.status(500).json({
      error: `[server]: Failed to fetch models from database. ERR: ${error}`,
    })
  }
}

export const getModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const modelId = req.params.id

    const model = await prisma.model.findUnique({
      where: {
        id: modelId,
      },
      include: {
        owner: {
          select: { displayName: true },
        },
        materials: {
          select: { name: true },
        },
        tags: {
          select: { name: true },
        },
        dimensions: {
          select: { type: true, value: true, unit: true },
        },
        hotspots: true,
        assets: true,
        images: { orderBy: { order: 'asc' } },
        pdfs: {
          select: { id: true, title: true },
        },
      },
    })

    if (!model) {
      res.status(404).json({ error: 'Model not found' })
      return
    }

    const thumbnailUrl = await generatePresignedUrl(
      BUCKET_NAME,
      `${model.id}/thumbnail.png`,
    )

    const imagesWithUrls = await Promise.all(
      model.images.map(async (img) => ({
        ...img,
        fullUrl: await generatePresignedUrl(
          BUCKET_NAME,
          `${model.id}/images/${img.id}/full.webp`,
        ),
        thumbUrl: await generatePresignedUrl(
          BUCKET_NAME,
          `${model.id}/images/${img.id}/thumb.webp`,
        ),
      })),
    )

    const pdfsWithUrls = await Promise.all(
      model.pdfs.map(async (pdf) => ({
        ...pdf,
        url: await generateFilePresignedUrl(
          BUCKET_NAME,
          `${model.id}/pdfs/${pdf.id}.pdf`,
          pdf.title ?? 'article.pdf',
        ),
      })),
    )

    const modelData = {
      ...model,
      thumbnailUrl,
      images: imagesWithUrls,
      pdfs: pdfsWithUrls,
    }

    res.status(200).json({ model: modelData })
  } catch (error) {
    console.error('[server]: Failed to fetch model data. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to fetch model data. ERR: ${error}`,
    })
  }
}

export const getModelThumbnailUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id

  try {
    const thumbnailUrl = await generatePresignedUrl(
      BUCKET_NAME,
      `${modelId}/thumbnail.png`,
    )
    res.status(200).json({ thumbnailUrl })
  } catch (error) {
    console.error('[server]: Failed to generate presigned URL. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to generate presigned URL. ERR: ${error}`,
    })
  }
}

export const getModelObjectUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id
  const { textures } = req.query

  const model = await prisma.model.findUnique({
    where: { id: modelId },
    select: { objFileType: true },
  })

  if (!model) {
    res.status(404).json({ error: 'Model not found' })
    return
  }

  try {
    if (model.objFileType === 'GLB') {
      const objectUrl = await generatePresignedUrl(
        BUCKET_NAME,
        `${modelId}/model.glb`,
      )

      res.status(200).json({ objectUrl })
      return
    }

    if (model.objFileType === 'OBJ') {
      const textureFilenames = (textures as string).split(',').filter(Boolean)
      const objUrl = await generatePresignedUrl(
        BUCKET_NAME,
        `${modelId}/model.obj`,
      )
      const mtlUrl = await generatePresignedUrl(
        BUCKET_NAME,
        `${modelId}/materials.mtl`,
      )
      const textureUrls = await Promise.all(
        textureFilenames.map(async (filename) => ({
          filename,
          url: await generatePresignedUrl(
            BUCKET_NAME,
            `${modelId}/textures/${filename}`,
          ),
        })),
      )

      res.status(200).json({ objUrl, mtlUrl, textureUrls })
    }
  } catch (error) {
    console.error('[server]: Failed to generate presigned URL. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to generate presigned URL. ERR: ${error}`,
    })
  }
}

export const getModelUploadUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { modelId, fileType, textures } = req.body

  try {
    const thumbnailUrl = await generatePresignedUploadUrl(
      BUCKET_NAME,
      `${modelId}/thumbnail.png`,
    )

    if (fileType === 'GLB') {
      const modelUrl = await generatePresignedUploadUrl(
        BUCKET_NAME,
        `${modelId}/model.glb`,
      )

      res.status(200).json({ modelUrl, thumbnailUrl })
      return
    }

    if (fileType === 'OBJ') {
      const modelUrl = await generatePresignedUploadUrl(
        BUCKET_NAME,
        `${modelId}/model.obj`,
      )

      const materialsUrl = await generatePresignedUploadUrl(
        BUCKET_NAME,
        `${modelId}/materials.mtl`,
      )

      const textureUrls = await Promise.all(
        textures.map((filename: string) =>
          generatePresignedUploadUrl(
            BUCKET_NAME,
            `${modelId}/textures/${filename}`,
          ).then((url) => ({ filename, url })),
        ),
      )

      res
        .status(200)
        .json({ modelUrl, materialsUrl, thumbnailUrl, textureUrls })
    }
  } catch (error) {
    console.error('[server]: Failed to generate upload URL. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to generate upload URL. ERR: ${error}`,
    })
  }
}

export const newModel = async (
  req: Request<unknown, unknown, ModelRequestBody>,
  res: Response,
): Promise<void> => {
  const user = req.user

  if (!user) {
    res.status(401).send('Unauthorized')
    return
  }

  const {
    id,
    name,
    caption,
    description,
    accNum,
    provenance,
    downloadable,
    objFileType,
    tags,
    materials,
    dimensions,
    hotspots,
    assets,
  } = req.body

  const createModel = prisma.model.create({
    data: {
      id,
      ownerId: user.id,
      name,
      caption,
      description,
      accNum,
      provenance,
      downloadable,
      objFileType,
      tags: {
        connectOrCreate: tags,
      },
      materials: {
        connectOrCreate: materials,
      },
    },
  })

  const createDimensions = prisma.dimension.createMany({
    data: dimensions,
  })

  const createHotspots = prisma.hotspot.createMany({
    data: hotspots,
  })

  const createAssets = prisma.asset.createMany({
    data: assets,
  })

  try {
    await withPrismaRetry(() =>
      prisma.$transaction([
        createModel,
        createDimensions,
        createHotspots,
        createAssets,
      ]),
    )

    res.status(201).json({ message: 'Model created successfully', modelId: id })
  } catch (error) {
    console.error('[server] Failed to create model. ERR:', error)
    res.status(500).json({
      error: `[server]: Failed to create model. ERR: ${error}`,
    })
  }
}

export const updateModel = async (
  req: Request<{ id: string }, unknown, ModelRequestBody>,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).send('Unauthorized')
    return
  }

  const { id: paramId } = req.params

  const {
    id: bodyId,
    name,
    caption,
    description,
    accNum,
    provenance,
    downloadable,
    tags,
    materials,
    dimensions,
    hotspots,
  } = req.body

  if (paramId !== bodyId) {
    res.status(400).json({
      error: 'Model ID in URL does not match the ID in the request body',
    })
    return
  }

  const updateBaseModel = prisma.model.update({
    where: { id: bodyId },
    data: {
      name,
      caption,
      description,
      accNum,
      provenance,
      downloadable,
      tags: { set: [], connectOrCreate: tags },
      materials: { set: [], connectOrCreate: materials },
    },
  })

  const deleteOldDimensions = prisma.dimension.deleteMany({
    where: { modelId: bodyId },
  })

  const deleteOldHotspots = prisma.hotspot.deleteMany({
    where: { modelId: bodyId },
  })

  const addNewDimensions = prisma.dimension.createMany({
    data: dimensions,
  })

  const addNewHotspots = prisma.hotspot.createMany({
    data: hotspots,
  })

  try {
    await withPrismaRetry(() =>
      prisma.$transaction([
        updateBaseModel,
        deleteOldDimensions,
        deleteOldHotspots,
        addNewDimensions,
        addNewHotspots,
      ]),
    )

    res
      .status(200)
      .json({ message: 'Model updated successfully', modelId: bodyId })
  } catch (error) {
    console.error('[server]: Failed to update model. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to update model. ERR: ${error}`,
    })
  }
}

export const deleteModel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    res.status(401).send('Unauthorized')
    return
  }

  const modelId = req.params.id

  if (!modelId) {
    res.status(400).json({ error: 'Model ID is required' })
    return
  }

  try {
    const existing = await prisma.model.findUnique({
      where: { id: modelId },
    })

    if (!existing) {
      res.status(404).json({ error: `Model ${modelId} not found.` })
      return
    }

    await Promise.all([
      prisma.model.delete({ where: { id: modelId } }),
      deleteAllFromR2(BUCKET_NAME, `${modelId}/`),
    ])

    res.status(200).json({ message: `Model ${modelId} deleted successfully!` })
  } catch (error) {
    console.error('[server]: Failed to delete model. ERR: ', error)
    res.status(500).json({
      error: `[server]: Failed to delete model. ERR: ${error}`,
    })
  }
}
