import { Request, Response } from "express";
import prisma from "../services/prisma";
import {
  generatePresignedUrl,
  generatePresignedUploadUrl,
} from "../scripts/r2Storage";

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
  const { temp = false } = req.query;

  try {
    const objectKey = temp
      ? `temp/${modelId}/model.glb`
      : `${modelId}/model.glb`;

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
  const { modelId, filename } = req.body;

  try {
    const uploadUrl = await generatePresignedUploadUrl(
      BUCKET_NAME,
      `temp/${modelId}/${filename}`,
    );

    res.status(200).json({ uploadUrl });
  } catch (error) {
    console.error("[server]: Failed to generate upload URL. ERR: ", error);
    res.status(500).json({
      error: `[server]: Failed to enerate upload URL. ERR: ${error}`,
    });
  }
};

export const newModel = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Create a new model" });
};
