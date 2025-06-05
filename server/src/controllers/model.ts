import { Request, Response } from "express";
import prisma from "../services/prisma";
import {
  generatePresignedUrl,
  generatePresignedUploadUrl,
  deleteObjectFromR2,
} from "../scripts/r2Storage";
import { ModelRequestBody } from "../scripts/validators";
import { withPrismaRetry } from "../scripts/prisma";

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export const getModels = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 18;
    const skip = Number(req.query.skip) || 0;

    const total = await prisma.model.count();

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
        thumbnailPath: true,
        downloadable: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: skip,
    });
    res.status(200).json({ models, total });
  } catch (error) {
    console.error(
      "[server]: Failed to fetch models from database. ERR: ",
      error,
    );
    res.status(500).json({
      error: `[server]: Failed to fetch models from database. ERR: ${error}`,
    });
  }
};

export const getModel = async (req: Request, res: Response): Promise<void> => {
  try {
    const modelId = req.params.id;

    const model = await prisma.model.findUnique({
      where: {
        id: modelId,
      },
      include: {
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
      },
    });

    res.status(200).json({ model });
  } catch (error) {
    console.error("[server]: Failed to fetch model data. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to fetch model data. ERR: ${error}`,
    });
  }
};

export const getModelThumbnailUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id;

  try {
    const thumbnailUrl = await generatePresignedUrl(
      BUCKET_NAME,
      `${modelId}/thumbnail.png`,
    );
    res.status(200).json({ thumbnailUrl });
  } catch (error) {
    console.error("[server]: Failed to generate presigned URL. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to generate presigned URL. ERR: ${error}`,
    });
  }
};

export const getModelObjectUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id;

  try {
    const objectKey = `${modelId}/model.glb`;

    const objectUrl = await generatePresignedUrl(BUCKET_NAME, objectKey);
    res.status(200).json({ objectUrl });
  } catch (error) {
    console.error("[server]: Failed to generate presigned URL. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to generate presigned URL. ERR: ${error}`,
    });
  }
};

export const getModelUploadUrl = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { modelId } = req.body;

  try {
    const modelUrl = await generatePresignedUploadUrl(
      BUCKET_NAME,
      `${modelId}/model.glb`,
    );

    const thumbnailUrl = await generatePresignedUploadUrl(
      BUCKET_NAME,
      `${modelId}/thumbnail.png`,
    );

    res.status(200).json({ modelUrl, thumbnailUrl });
  } catch (error) {
    console.error("[server]: Failed to generate upload URL. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to enerate upload URL. ERR: ${error}`,
    });
  }
};

export const newModel = async (
  req: Request<unknown, unknown, ModelRequestBody>,
  res: Response,
): Promise<void> => {
  const {
    id,
    name,
    caption,
    description,
    accNum,
    downloadable,
    tags,
    materials,
    dimensions,
    hotspots,
  } = req.body;

  const createModel = prisma.model.create({
    data: {
      id,
      name,
      caption,
      description,
      accNum,
      downloadable,
      modelPath: `${id}/model.glb`,
      thumbnailPath: `${id}/thumbnail.png`,
      multimediaPath: [],
      tags: {
        connectOrCreate: tags,
      },
      materials: {
        connectOrCreate: materials,
      },
    },
  });

  const createDimensions = prisma.dimension.createMany({
    data: dimensions,
  });

  const createHotspots = prisma.hotspot.createMany({
    data: hotspots,
  });

  try {
    await withPrismaRetry(() =>
      prisma.$transaction([createModel, createDimensions, createHotspots]),
    );

    res
      .status(201)
      .json({ message: "Model created successfully", modelId: id });
  } catch (error) {
    console.error("[server] Failed to create model. ERR:", error);
    res.status(500).json({
      error: `[server]: Failed to create model. ERR: ${error}`,
    });
  }
};

export const updateModel = async (
  req: Request<unknown, unknown, ModelRequestBody>,
  res: Response,
): Promise<void> => {
  const {
    id,
    name,
    caption,
    description,
    accNum,
    downloadable,
    tags,
    materials,
    dimensions,
    hotspots,
  } = req.body;

  const updateBaseModel = prisma.model.update({
    where: { id },
    data: {
      name,
      caption,
      description,
      accNum,
      downloadable,
      tags: { set: [], connectOrCreate: tags },
      materials: { set: [], connectOrCreate: materials },
    },
  });

  const deleteOldDimensions = prisma.dimension.deleteMany({
    where: { modelId: id },
  });

  const deleteOldHotspots = prisma.hotspot.deleteMany({
    where: { modelId: id },
  });

  const addNewDimensions = prisma.dimension.createMany({
    data: dimensions,
  });

  const addNewHotspots = prisma.hotspot.createMany({
    data: hotspots,
  });

  try {
    await withPrismaRetry(() =>
      prisma.$transaction([
        updateBaseModel,
        deleteOldDimensions,
        deleteOldHotspots,
        addNewDimensions,
        addNewHotspots,
      ]),
    );

    res
      .status(200)
      .json({ message: "Model updated successfully", modelId: id });
  } catch (error) {
    console.error("[server]: Failed to update model. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to create model. ERR: ${error}`,
    });
  }
};

export const deleteModel = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const modelId = req.params.id;

  if (!modelId) {
    res.status(400).json({ error: "Model ID is required" });
    return;
  }

  try {
    const existing = await prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!existing) {
      res.status(404).json({ error: `Model ${modelId} not found.` });
      return;
    }

    await prisma.model.delete({
      where: {
        id: modelId,
      },
    });

    const filesToDelete = [
      `${modelId}/model.glb`,
      // Add thumbnail and multimedia files here
    ];

    for (const file of filesToDelete) {
      await deleteObjectFromR2(BUCKET_NAME, file);
    }

    res.status(200).json({ message: `Model ${modelId} deleted successfully!` });
  } catch (error) {
    console.error("[server]: Failed to delete model. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to delete model. ERR: ${error}`,
    });
  }
};
